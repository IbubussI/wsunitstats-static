package com.wsunitstats.exporter.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wsunitstats.exporter.service.impl.EngineNodeType;
import com.wsunitstats.exporter.service.impl.EngineTreeNode;
import com.wsunitstats.exporter.service.impl.FileEntry;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Builds the tree of the engine data for the docs page. A node holds only its key, type and leaf value: the UI builds
 * the node paths from the keys and derives all the node details from them. A subtree equal to one built earlier
 * is not repeated, it becomes a link to the path of the first one
 */
public class EngineDataBuilder {
    private static final int MAX_JSON_SIZE = 3_000_000;
    // smaller equal subtrees (positions, colors) are repeated, so they can be read in place
    private static final int LINK_MIN_NODES = 32;
    // estimated json length of a node apart from its key and value: {"k":"","v":"","tp":"func","ch":[]},
    private static final int NODE_JSON_LENGTH_OVERHEAD = 30;
    private static final String HOME = "home";
    private static final String ROOT = "root";
    private static final String PATH_DELIMITER = ".";
    // path segments starting with a digit are written as [key], the same as the UI does
    private static final Pattern INDEX_KEY_PATTERN = Pattern.compile("^\\d.*");
    private static final String FUNCTION_PREFIX = "f_";
    private static final String TAGS_VALUE = "value";
    private static final int TAGS_COUNT = 64;

    private final List<FileEntry> treeFileEntries = new ArrayList<>();
    // path of the first subtree with the digest
    private final Map<ByteBuffer, String> subtreePaths = new HashMap<>();
    private final MessageDigest messageDigest;

    /** Node with its content digest and the number of nodes in its subtree, used to find equal subtrees */
    private record BuiltNode(EngineTreeNode node, byte[] digest, int nodeCount) {
    }

    public EngineDataBuilder() {
        try {
            messageDigest = MessageDigest.getInstance("SHA-1");
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }

    /** Tree files: the home file with the tree top and files with the children of the nodes loaded on demand */
    public List<FileEntry> getTreeFileEntries() {
        return treeFileEntries;
    }

    /**
     * @param inputObjects engine data roots by folder name, in the order of the folders; equal subtrees link to the earlier ones
     */
    public void build(Map<String, ObjectNode> inputObjects) {
        EngineTreeNode home = new EngineTreeNode(HOME, null, EngineNodeType.HOME);
        List<EngineTreeNode> folders = new ArrayList<>();
        int foldersSize = 0;
        for (Map.Entry<String, ObjectNode> inputObject : inputObjects.entrySet()) {
            String folderName = inputObject.getKey();
            EngineTreeNode root = buildNode(inputObject.getValue(), ROOT, folderName + PATH_DELIMITER + ROOT, EngineNodeType.ROOT).node();
            root.setIsAsync(false);

            EngineTreeNode folder = new EngineTreeNode(folderName, null, EngineNodeType.FOLDER);
            folder.setIsAsync(false);
            folder.setChildren(List.of(root));
            folder.setSubtreeSize(folderName.length() + root.getSubtreeSize() + NODE_JSON_LENGTH_OVERHEAD);
            folders.add(folder);
            foldersSize += folder.getSubtreeSize();
        }
        home.setExpanded(true);
        home.setChildren(folders);
        home.setSubtreeSize(HOME.length() + foldersSize + NODE_JSON_LENGTH_OVERHEAD);

        treeFileEntries.add(new FileEntry(HOME, home));
        addFileEntries(home.getChildren(), home.getSubtreeSize(), null);
    }

    /**
     * Splits the tree into files: the children of the nodes of a large subtree are loaded on demand from a file
     * named by the dot separated path of the node
     */
    private void addFileEntries(List<EngineTreeNode> nodes, int parentSubtreeSize, String parentFileName) {
        for (EngineTreeNode node : nodes) {
            String fileName = parentFileName == null ? node.getKey() : parentFileName + PATH_DELIMITER + node.getKey();
            List<EngineTreeNode> children = node.getChildren();
            if (parentSubtreeSize > MAX_JSON_SIZE && children != null && node.getIsAsync() == null) {
                node.setIsAsync(true);
                treeFileEntries.add(new FileEntry(fileName, children));
            }
            if (children != null) {
                addFileEntries(children, node.getSubtreeSize(), fileName);
            }
        }
    }

    /**
     * @param path the path of the node as the UI builds it, e.g. gameplay.root.unitType[27].paths
     */
    private BuiltNode buildNode(JsonNode json, String key, String path, EngineNodeType containerType) {
        return switch (json.getNodeType()) {
            case OBJECT -> isTagsValue((ObjectNode) json)
                    ? buildLeaf(key, tagsToSetString((ObjectNode) json), EngineNodeType.TAGS)
                    : buildContainer(json, key, path, containerType);
            case ARRAY -> buildContainer(json, key, path, containerType);
            case BOOLEAN -> buildLeaf(key, json.asText(), EngineNodeType.BOOLEAN);
            case NUMBER -> buildLeaf(key, json.asText(), EngineNodeType.NUMBER);
            default -> isFunction(key, json.asText())
                    ? buildLeaf(key, json.asText(), EngineNodeType.FUNCTION)
                    : buildLeaf(key, json.asText(), EngineNodeType.STRING);
        };
    }

    private BuiltNode buildContainer(JsonNode json, String key, String path, EngineNodeType type) {
        List<EngineTreeNode> children = new ArrayList<>();
        List<String> childKeys = new ArrayList<>();
        List<byte[]> childDigests = new ArrayList<>();
        int childrenSize = 0;
        int nodeCount = 1;
        for (Iterator<Map.Entry<String, JsonNode>> it = json.isArray() ? arrayFields(json) : json.fields(); it.hasNext(); ) {
            Map.Entry<String, JsonNode> field = it.next();
            String childKey = field.getKey();
            String childPath = getChildPath(path, childKey);
            BuiltNode child = buildNode(field.getValue(), childKey, childPath, EngineNodeType.OBJECT);
            EngineTreeNode childNode = child.node();

            if (childNode.getChildren() != null && child.nodeCount() >= LINK_MIN_NODES) {
                String firstPath = subtreePaths.putIfAbsent(ByteBuffer.wrap(child.digest()), childPath);
                if (firstPath != null) {
                    childNode = new EngineTreeNode(childKey, firstPath, EngineNodeType.LINK);
                    childNode.setSubtreeSize(childKey.length() + firstPath.length() + NODE_JSON_LENGTH_OVERHEAD);
                }
            }
            children.add(childNode);
            childKeys.add(childKey);
            // the digest of the content, not of the link: a parent equal to an earlier one has the same digest
            childDigests.add(child.digest());
            childrenSize += childNode.getSubtreeSize();
            nodeCount += child.nodeCount();
        }

        messageDigest.reset();
        update(json.isArray() ? "array" : "object");
        for (int i = 0; i < childKeys.size(); ++i) {
            update(childKeys.get(i));
            messageDigest.update(childDigests.get(i));
        }

        EngineTreeNode node = new EngineTreeNode(key, null, type);
        node.setChildren(children);
        node.setSubtreeSize(key.length() + childrenSize + NODE_JSON_LENGTH_OVERHEAD);
        return new BuiltNode(node, messageDigest.digest(), nodeCount);
    }

    private BuiltNode buildLeaf(String key, String value, EngineNodeType type) {
        EngineTreeNode node = new EngineTreeNode(key, value, type);
        node.setSubtreeSize(key.length() + value.length() + NODE_JSON_LENGTH_OVERHEAD);
        messageDigest.reset();
        update(type.getId());
        update(value);
        return new BuiltNode(node, messageDigest.digest(), 1);
    }

    /** Adds the text to the digest with a separator, so that different splits of the same text differ */
    private void update(String text) {
        messageDigest.update(text.getBytes(StandardCharsets.UTF_8));
        messageDigest.update((byte) 0);
    }

    private static Iterator<Map.Entry<String, JsonNode>> arrayFields(JsonNode array) {
        List<Map.Entry<String, JsonNode>> fields = new ArrayList<>();
        for (int i = 0; i < array.size(); ++i) {
            JsonNode item = array.get(i);
            if (item == null) {
                throw new IllegalStateException("Unexpected null in json arrayNode");
            }
            fields.add(Map.entry(String.valueOf(i), item));
        }
        return fields.iterator();
    }

    private static String getChildPath(String path, String key) {
        return INDEX_KEY_PATTERN.matcher(key).matches()
                ? path + "[" + key + "]"
                : path + PATH_DELIMITER + key;
    }

    private static boolean isFunction(String key, String value) {
        return key.startsWith(FUNCTION_PREFIX) && value.startsWith("(") && value.endsWith(")");
    }

    /** Tags: 64 boolean flags by index and their numeric value */
    private static boolean isTagsValue(ObjectNode object) {
        if (!object.has(TAGS_VALUE) || !object.get(TAGS_VALUE).isNumber() || object.size() != TAGS_COUNT + 1) {
            return false;
        }
        for (int i = 0; i < TAGS_COUNT; ++i) {
            JsonNode flag = object.get(String.valueOf(i));
            if (flag == null || !flag.isBoolean()) {
                return false;
            }
        }
        return true;
    }

    /** @return active tags, e.g. {0,5,12}; the numeric value and the binary string are derived from them in the UI */
    private static String tagsToSetString(ObjectNode tags) {
        StringBuilder setTags = new StringBuilder("{");
        for (int i = 0; i < TAGS_COUNT; ++i) {
            if (tags.get(String.valueOf(i)).asBoolean()) {
                if (setTags.length() > 1) {
                    setTags.append(",");
                }
                setTags.append(i);
            }
        }
        return setTags.append("}").toString();
    }
}
