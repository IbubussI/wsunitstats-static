package com.wsunitstats.exporter.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wsunitstats.exporter.service.impl.EngineNodeType;
import com.wsunitstats.exporter.service.impl.EngineTreeNode;
import com.wsunitstats.exporter.service.impl.EngineTreeNodeContext;
import com.wsunitstats.exporter.service.impl.EngineTreeNodeProperty;
import com.wsunitstats.exporter.service.impl.EngineTreeNodeTextContent;
import com.wsunitstats.exporter.service.impl.FileEntry;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class EngineDataBuilder {
    private static final int MAX_JSON_SIZE = 3_000_000;
    private static final String ROOT = "root";
    private static final String HOME = "home";
    private static final Pattern INDEX_ACCESSOR_PATTERN = Pattern.compile("\\.(\\d+)\\.?");
    private static final String TREE_PATH_DELIMITER = ".";
    private static final String NON_TERMINAL_REPLACEMENT_TEMPLATE = "[%s].";
    private static final String TERMINAL_REPLACEMENT_TEMPLATE = "[%s]";
    private static final String BATCH_NAME_PREFIX = "b";
    private static final int TREE_NODE_JSON_LENGTH_OVERHEAD = 30;
    public static final int PROPERTY_JSON_LENGTH_OVERHEAD = 8;
    public static final int CONTAINER_JSON_LENGTH_OVERHEAD = 10;
    public static final int CONTAINER_ITEM_JSON_LENGTH_OVERHEAD = 2;
    private static final String FUNCTION_PREFIX = "f_";
    private static final String TAGS_VALUE = "value";
    private static final String SELF = "__self";
    private static final String ARGS = "__args";
    private static final String ENGINE_PATH = "Engine path";
    private static final String NAME = "Name";

    private final List<FileEntry> treeFileEntries;
    private final List<FileEntry> contextFileEntries;
    private Map<String, EngineTreeNodeContext> contextBatchEntries = new HashMap<>();
    private int currentBatchSize = 0;

    public EngineDataBuilder() {
        treeFileEntries = new ArrayList<>();
        contextFileEntries = new ArrayList<>();
    }

    public List<FileEntry> getTreeFileEntries() {
        return treeFileEntries;
    }

    public List<FileEntry> getContextFileEntries() {
        return contextFileEntries;
    }

    public void build(Map<String, ObjectNode> inputObjects) throws JsonProcessingException {
        EngineTreeNode rootNode = buildRootNode(inputObjects);
        treeFileEntries.add(new FileEntry(rootNode.getId(), rootNode));

        contextBatchEntries.put(rootNode.getId(), rootNode.getContext());
        rootNode.setContextBatch(BATCH_NAME_PREFIX + contextFileEntries.size());
        currentBatchSize += rootNode.getContext().getJsonSize();
        // second traverse here is required to know subtree size in advance
        // to group nodes to files with appropriate sizes
        addFilePathEntries(rootNode.getChildren(), rootNode.getSubtreeSize());
        contextFileEntries.add(new FileEntry(BATCH_NAME_PREFIX + contextFileEntries.size(), contextBatchEntries));
    }

    private void addFilePathEntries(List<EngineTreeNode> parentChildren, int subtreeSize) {
        for (EngineTreeNode node : parentChildren) {
            List<EngineTreeNode> children = node.getChildren();

            if (subtreeSize > MAX_JSON_SIZE && children != null && node.getIsAsync() == null) {
                node.setIsAsync(true);
                treeFileEntries.add(new FileEntry(node.getId(), children));
            }

            String currentBatchName = BATCH_NAME_PREFIX + contextFileEntries.size();
            if (currentBatchSize > MAX_JSON_SIZE) {
                contextFileEntries.add(new FileEntry(currentBatchName, contextBatchEntries));
                contextBatchEntries = new HashMap<>();
                currentBatchSize = 0;
            }

            node.setContextBatch(currentBatchName);
            contextBatchEntries.put(node.getId(), node.getContext());
            currentBatchSize += node.getContext().getJsonSize();

            if (children != null) {
                addFilePathEntries(children, node.getSubtreeSize());
            }
        }
    }

    private EngineTreeNode buildRootNode(Map<String, ObjectNode> firstLevelObjects) throws JsonProcessingException {
        EngineTreeNode node = new EngineTreeNode(HOME, "", EngineNodeType.HOME, HOME, new EngineTreeNodeContext());
        List<EngineTreeNode> children = new ArrayList<>();
        int childrenSubtreeLength = 0;
        for (Map.Entry<String, ObjectNode> firstLevelObject : firstLevelObjects.entrySet()) {
            String folderName = firstLevelObject.getKey();
            EngineTreeNode firstLevelTreeNode = buildEngineRootNode(firstLevelObject.getValue(), folderName);
            firstLevelTreeNode.setIsAsync(false);

            // wrap child root into a folder
            EngineTreeNode firstLevelTreeFolder = new EngineTreeNode(folderName, folderName, EngineNodeType.FOLDER, folderName, new EngineTreeNodeContext());
            firstLevelTreeFolder.setIsAsync(false);
            firstLevelTreeFolder.setChildren(List.of(firstLevelTreeNode));
            int folderSubtreeSize = folderName.length() + folderName.length() + firstLevelTreeNode.getSubtreeSize() + TREE_NODE_JSON_LENGTH_OVERHEAD;
            firstLevelTreeFolder.setSubtreeSize(folderSubtreeSize);

            children.add(firstLevelTreeFolder);
            childrenSubtreeLength += folderSubtreeSize;
        }

        node.setExpanded(true);
        node.setChildren(children);
        node.setSubtreeSize(HOME.length() + HOME.length() + childrenSubtreeLength + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildEngineRootNode(ObjectNode inputObject, String parentId) throws JsonProcessingException {
        String id = parentId + TREE_PATH_DELIMITER + ROOT;
        List<EngineTreeNode> children = new ArrayList<>();
        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent(NAME, ROOT));
        textContent.add(new EngineTreeNodeTextContent(ENGINE_PATH, ROOT));

        EngineTreeNode node = new EngineTreeNode(id, ROOT, EngineNodeType.ROOT, id, new EngineTreeNodeContext(properties, textContent));
        int childrenSubtreeLength = 0;
        for (Iterator<Map.Entry<String, JsonNode>> it = inputObject.fields(); it.hasNext(); ) {
            Map.Entry<String, JsonNode> entry = it.next();
            String childKey = entry.getKey();
            JsonNode childNode = entry.getValue();

            EngineTreeNode childTreeNode;
            switch (childNode.getNodeType()) {
                case OBJECT -> {
                    ObjectNode objectChildNode = (ObjectNode) childNode;
                    if (isTagsValue(objectChildNode)) {
                        String tagSetValue = tagsToSetString(objectChildNode);
                        childTreeNode = buildTagsValue(objectChildNode, childKey, id, tagSetValue);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.TAGS, tagSetValue));
                    } else {
                        childTreeNode = buildJsonObject(objectChildNode, childKey, id);
                    }
                }
                case ARRAY -> childTreeNode = buildJsonArray((ArrayNode) childNode, childKey, id);
                case BOOLEAN -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, id, EngineNodeType.BOOLEAN);
                    properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.BOOLEAN, childNode.asText()));
                }
                case NUMBER -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, id, EngineNodeType.NUMBER);
                    properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.NUMBER, childNode.asText()));
                }
                default -> {
                    if (isFunction(childKey, childNode.asText())) {
                        String value = childNode.asText();
                        String funcValue = childKey + value;
                        childTreeNode = buildFunctionValue(value, childKey, id, funcValue);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.FUNCTION, funcValue));
                    } else {
                        childTreeNode = buildStringValue(childNode.asText(), childKey, id, EngineNodeType.STRING);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.STRING, childNode.asText()));
                    }
                }
            }
            childrenSubtreeLength += childTreeNode.getSubtreeSize();
            children.add(childTreeNode);
        }

        node.setChildren(children);
        node.setSubtreeSize(ROOT.length() + ROOT.length() + childrenSubtreeLength + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildJsonObject(ObjectNode inputObject, String key, String parentId)
            throws JsonProcessingException {
        String pureId = parentId + TREE_PATH_DELIMITER + key;
        String path = makeId(pureId);
        List<EngineTreeNode> children = new ArrayList<>();
        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent(NAME, key));
        textContent.add(new EngineTreeNodeTextContent(ENGINE_PATH, getEnginePath(path)));

        int childrenSubtreeLength = 0;
        for (Iterator<Map.Entry<String, JsonNode>> it = inputObject.fields(); it.hasNext(); ) {
            Map.Entry<String, JsonNode> entry = it.next();
            String childKey = entry.getKey();
            JsonNode childNode = entry.getValue();

            EngineTreeNode childTreeNode;
            switch (childNode.getNodeType()) {
                case OBJECT -> {
                    ObjectNode objectChildNode = (ObjectNode) childNode;
                    if (isTagsValue(objectChildNode)) {
                        String tagSetValue = tagsToSetString(objectChildNode);
                        childTreeNode = buildTagsValue(objectChildNode, childKey, pureId, tagSetValue);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.TAGS, tagSetValue));
                    } else {
                        childTreeNode = buildJsonObject(objectChildNode, childKey, pureId);
                    }
                }
                case ARRAY -> childTreeNode = buildJsonArray((ArrayNode) childNode, childKey, pureId);
                case BOOLEAN -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, EngineNodeType.BOOLEAN);
                    properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.BOOLEAN, childNode.asText()));
                }
                case NUMBER -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, EngineNodeType.NUMBER);
                    properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.NUMBER, childNode.asText()));
                }
                default -> {
                    if (isFunction(childKey, childNode.asText())) {
                        String value = childNode.asText();
                        String funcValue = childKey + value;
                        childTreeNode = buildFunctionValue(value, childKey, pureId, funcValue);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.FUNCTION, funcValue));
                    } else {
                        childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, EngineNodeType.STRING);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.STRING, childNode.asText()));
                    }
                }
            }
            childrenSubtreeLength += childTreeNode.getSubtreeSize();
            children.add(childTreeNode);
        }

        EngineTreeNode node = new EngineTreeNode(path, key, EngineNodeType.OBJECT, pureId, new EngineTreeNodeContext(properties, textContent));
        node.setChildren(children);
        node.setSubtreeSize(path.length() + key.length() + childrenSubtreeLength + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildJsonArray(ArrayNode inputArray, String key, String parentId)
            throws JsonProcessingException {
        String pureId = parentId + TREE_PATH_DELIMITER + key;
        String path = makeId(pureId);
        List<EngineTreeNode> children = new ArrayList<>();
        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent(NAME, key));
        textContent.add(new EngineTreeNodeTextContent(ENGINE_PATH, getEnginePath(path)));

        int childrenSubtreeLength = 0;
        for (int i = 0; i < inputArray.size(); ++i) {
            String childKey = String.valueOf(i);
            JsonNode childNode = inputArray.get(i);
            if (childNode == null) {
                throw new IllegalStateException("Unexpected null in json arrayNode");
            }

            EngineTreeNode childTreeNode;
            switch (childNode.getNodeType()) {
                case OBJECT -> {
                    ObjectNode objectChildNode = (ObjectNode) childNode;
                    if (isTagsValue(objectChildNode)) {
                        String tagSetValue = tagsToSetString(objectChildNode);
                        childTreeNode = buildTagsValue(objectChildNode, childKey, pureId, tagSetValue);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.TAGS, tagSetValue));
                    } else {
                        childTreeNode = buildJsonObject(objectChildNode, childKey, pureId);
                    }
                }
                case ARRAY -> childTreeNode = buildJsonArray((ArrayNode) childNode, childKey, pureId);
                case BOOLEAN -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, EngineNodeType.BOOLEAN);
                    properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.BOOLEAN, childNode.asText()));
                }
                case NUMBER -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, EngineNodeType.NUMBER);
                    properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.NUMBER, childNode.asText()));
                }
                default -> {
                    if (isFunction(childKey, childNode.asText())) {
                        String value = childNode.asText();
                        String funcValue = childKey + value;
                        childTreeNode = buildFunctionValue(value, childKey, pureId, funcValue);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.FUNCTION, funcValue));
                    } else {
                        childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, EngineNodeType.STRING);
                        properties.add(new EngineTreeNodeProperty(childKey, EngineNodeType.STRING, childNode.asText()));
                    }
                }
            }
            childrenSubtreeLength += childTreeNode.getSubtreeSize();
            children.add(childTreeNode);
        }

        EngineTreeNode node = new EngineTreeNode(path, key, EngineNodeType.OBJECT, pureId, new EngineTreeNodeContext(properties, textContent));
        node.setChildren(children);
        node.setSubtreeSize(path.length() + key.length() + childrenSubtreeLength + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildStringValue(String value, String key, String parentId, EngineNodeType type) {
        String pureId = parentId + TREE_PATH_DELIMITER + key;
        String path = makeId(pureId);
        String label = key + ": " + value;

        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent(NAME, key));
        textContent.add(new EngineTreeNodeTextContent(ENGINE_PATH, getEnginePath(path)));
        properties.add(new EngineTreeNodeProperty(SELF, type, value));

        EngineTreeNode node = new EngineTreeNode(path, label, type, pureId, new EngineTreeNodeContext(properties, textContent));
        node.setSubtreeSize(path.length() + label.length() + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildFunctionValue(String value, String key, String parentId, String functionValue) {
        String pureId = parentId + TREE_PATH_DELIMITER + key;
        String path = makeId(pureId);
        String argStringClear = value.replaceAll("[()]", "");

        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent(ENGINE_PATH, getEnginePath(path)));
        textContent.add(new EngineTreeNodeTextContent("Function Name", key));
        textContent.add(new EngineTreeNodeTextContent("Function Args", argStringClear));
        properties.add(new EngineTreeNodeProperty(ARGS, EngineNodeType.FUNCTION_ARGS, argStringClear));
        properties.add(new EngineTreeNodeProperty(SELF, EngineNodeType.FUNCTION, functionValue));

        // TODO: parse args string to make clear arg list
        // Current known notation:
        // optional args with/without default: (a1,a2[,a3,a4,a5=0,a6=1])
        // or statement: (a1,a2) or (b1) or (c1,c2,c3)
        // varargs: a1,b1[,a2,b2[...]]
        //String argStringRequired =
        //String argStringOptional =
        //String argEllipsis =

        EngineTreeNode node = new EngineTreeNode(path, functionValue, EngineNodeType.FUNCTION, pureId, new EngineTreeNodeContext(properties, textContent));
        node.setSubtreeSize(path.length() + functionValue.length() + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildTagsValue(ObjectNode tags, String key, String parentId, String tagSet) {
        String pureId = parentId + TREE_PATH_DELIMITER + key;
        String path = makeId(pureId);
        String binaryTagsString = tagsToBinaryString(tags);
        String decimalValue = tags.get(TAGS_VALUE).asText();
        String label = key + ": " + tagSet;

        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent(NAME, key));
        textContent.add(new EngineTreeNodeTextContent(ENGINE_PATH, getEnginePath(path)));
        textContent.add(new EngineTreeNodeTextContent("Decimal value", decimalValue));
        textContent.add(new EngineTreeNodeTextContent("Binary value", binaryTagsString));
        textContent.add(new EngineTreeNodeTextContent("Active tags", tagSet.substring(1, tagSet.length() - 1)));
        properties.add(new EngineTreeNodeProperty(TAGS_VALUE, EngineNodeType.NUMBER, decimalValue));
        properties.add(new EngineTreeNodeProperty(SELF, EngineNodeType.TAGS, tagSet));

        EngineTreeNode node = new EngineTreeNode(path, label, EngineNodeType.TAGS, pureId, new EngineTreeNodeContext(properties, textContent));
        node.setSubtreeSize(path.length() + label.length() + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private boolean isFunction(String key, String value) {
        return key.startsWith(FUNCTION_PREFIX) && value.startsWith("(") && value.endsWith(")");
    }

    private boolean isTagsValue(ObjectNode object) {
        boolean result = false;
        if (object.has(TAGS_VALUE) && object.get(TAGS_VALUE).isNumber()) {
            List<Integer> objectKeys = new ArrayList<>();
            for (Iterator<Map.Entry<String, JsonNode>> it = object.fields(); it.hasNext(); ) {
                Map.Entry<String, JsonNode> entry = it.next();
                String key = entry.getKey();
                JsonNode valueNode = entry.getValue();

                if (!key.equals(TAGS_VALUE)) {
                    if (!valueNode.isBoolean()) {
                        return false;
                    }
                    try {
                        int intKey = Integer.parseInt(key);
                        objectKeys.add(intKey);
                    } catch (NumberFormatException ex) {
                        return false;
                    }
                }
            }
            if (objectKeys.size() == 64) {
                Collections.sort(objectKeys);
                for (int i = 0; i < 64; ++i) {
                    if (objectKeys.get(i) != i) {
                        return false;
                    }
                }
                result = true;
            }
        }
        return result;
    }

    private String tagsToBinaryString(ObjectNode tags) {
        StringBuilder binaryTagsString =  new StringBuilder();
        for (int i = 63; i > -1; --i) {
            boolean tagValue = tags.get(String.valueOf(i)).asBoolean();
            binaryTagsString.append(tagValue ? "1" : "0");
        }
        return binaryTagsString.toString();
    }

    private String tagsToSetString(ObjectNode tags) {
        List<Integer> setTagsList = new ArrayList<>();
        for (int i = 0; i < 64; ++i) {
            boolean tagValue = tags.get(String.valueOf(i)).asBoolean();
            if (tagValue) {
                setTagsList.add(i);
            }
        }
        StringBuilder setTags = new StringBuilder("{");
        for (int i = 0; i < setTagsList.size(); ++i) {
            int tag = setTagsList.get(i);
            setTags.append(tag);
            if (i + 1 < setTagsList.size()) {
                setTags.append(",");
            }
        }
        setTags.append("}");
        return setTags.toString();
    }

    private String makeId(String pureId) {
        Matcher matcher = INDEX_ACCESSOR_PATTERN.matcher(pureId);
        StringBuilder output = new StringBuilder();
        while (matcher.find()) {
            String number = matcher.group(1);
            String replacement = matcher.end() == pureId.length()
                    ? String.format(TERMINAL_REPLACEMENT_TEMPLATE, number)
                    : String.format(NON_TERMINAL_REPLACEMENT_TEMPLATE, number);
            matcher.appendReplacement(output, replacement);
        }
        matcher.appendTail(output);
        return output.toString();
    }

    private String getEnginePath(String path) {
        return path.substring(path.indexOf(TREE_PATH_DELIMITER) + 1);
    }
}
