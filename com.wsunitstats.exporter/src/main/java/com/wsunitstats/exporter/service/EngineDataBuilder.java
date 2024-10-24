package com.wsunitstats.exporter.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wsunitstats.exporter.service.impl.EngineTreeNode;
import com.wsunitstats.exporter.service.impl.EngineTreeNodeContext;
import com.wsunitstats.exporter.service.impl.EngineTreeNodeProperty;
import com.wsunitstats.exporter.service.impl.EngineTreeNodeTextContent;
import com.wsunitstats.exporter.service.impl.FileEntry;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class EngineDataBuilder {
    private static final int MAX_JSON_SIZE = 1_000_000;
    private static final String ROOT = "root";
    private static final Pattern INDEX_ACCESSOR_PATTERN = Pattern.compile("\\.(\\d+)\\.?");
    private static final String TREE_PATH_DELIMITER = ".";
    private static final String NON_TERMINAL_REPLACEMENT_TEMPLATE = "[%s].";
    private static final String TERMINAL_REPLACEMENT_TEMPLATE = "[%s]";
    private static final String BATCH_NAME_PREFIX = "b";
    private static final int TREE_NODE_JSON_LENGTH_OVERHEAD = 30;
    public static final int PROPERTY_JSON_LENGTH_OVERHEAD = 8;
    public static final int CONTAINER_JSON_LENGTH_OVERHEAD = 10;
    public static final int CONTAINER_ITEM_JSON_LENGTH_OVERHEAD = 2;

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

    public void build(ObjectNode inputObject) throws JsonProcessingException {
        EngineTreeNode rootNode = buildRootNode(inputObject);
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

            if (subtreeSize > MAX_JSON_SIZE && children != null) {
                node.setAsync(true);
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

    private EngineTreeNode buildRootNode(ObjectNode inputObject)
            throws JsonProcessingException {
        List<EngineTreeNode> children = new ArrayList<>();
        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent("Name", ROOT));
        textContent.add(new EngineTreeNodeTextContent("Engine path", ROOT));

        EngineTreeNode node = new EngineTreeNode(ROOT, ROOT, ROOT, new EngineTreeNodeContext(properties, textContent));
        int childrenSubtreeLength = 0;
        for (Iterator<Map.Entry<String, JsonNode>> it = inputObject.fields(); it.hasNext(); ) {
            Map.Entry<String, JsonNode> entry = it.next();
            String childKey = entry.getKey();
            JsonNode childNode = entry.getValue();

            EngineTreeNode childTreeNode;
            switch (childNode.getNodeType()) {
                case OBJECT -> childTreeNode = buildJsonObject((ObjectNode) childNode, childKey, ROOT);
                case ARRAY -> childTreeNode = buildJsonArray((ArrayNode) childNode, childKey, ROOT);
                case BOOLEAN -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, ROOT, "Boolean");
                    properties.add(new EngineTreeNodeProperty(childKey, "Boolean", childNode.asText()));
                }
                case NUMBER -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, ROOT, "Number");
                    properties.add(new EngineTreeNodeProperty(childKey, "Number", childNode.asText()));
                }
                default -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, ROOT, "String");
                    properties.add(new EngineTreeNodeProperty(childKey, "String", childNode.asText()));
                }
            }
            childrenSubtreeLength += childTreeNode.getSubtreeSize();
            children.add(childTreeNode);
        }

        node.setExpanded(true);
        node.setChildren(children);
        node.setSubtreeSize(ROOT.length() + ROOT.length() + childrenSubtreeLength + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildJsonObject(ObjectNode inputObject, String parentKey, String parentId)
            throws JsonProcessingException {
        String pureId = parentId + TREE_PATH_DELIMITER + parentKey;
        String path = makeId(pureId);
        List<EngineTreeNode> children = new ArrayList<>();
        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent("Name", parentKey));
        textContent.add(new EngineTreeNodeTextContent("Engine path", path));

        int childrenSubtreeLength = 0;
        for (Iterator<Map.Entry<String, JsonNode>> it = inputObject.fields(); it.hasNext(); ) {
            Map.Entry<String, JsonNode> entry = it.next();
            String childKey = entry.getKey();
            JsonNode childNode = entry.getValue();

            EngineTreeNode childTreeNode;
            switch (childNode.getNodeType()) {
                case OBJECT -> childTreeNode = buildJsonObject((ObjectNode) childNode, childKey, pureId);
                case ARRAY -> childTreeNode = buildJsonArray((ArrayNode) childNode, childKey, pureId);
                case BOOLEAN -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, "Boolean");
                    properties.add(new EngineTreeNodeProperty(childKey, "Boolean", childNode.asText()));
                }
                case NUMBER -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, "Number");
                    properties.add(new EngineTreeNodeProperty(childKey, "Number", childNode.asText()));
                }
                default -> {
                    childTreeNode = buildStringValue(childNode.asText(), childKey, pureId, "String");
                    properties.add(new EngineTreeNodeProperty(childKey, "String", childNode.asText()));
                }
            }
            childrenSubtreeLength += childTreeNode.getSubtreeSize();
            children.add(childTreeNode);
        }

        EngineTreeNode node = new EngineTreeNode(path, parentKey, pureId, new EngineTreeNodeContext(properties, textContent));
        node.setChildren(children);
        node.setSubtreeSize(path.length() + parentKey.length() + childrenSubtreeLength + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildJsonArray(ArrayNode inputArray, String parentKey, String parentId)
            throws JsonProcessingException {
        String pureId = parentId + TREE_PATH_DELIMITER + parentKey;
        String path = makeId(pureId);
        List<EngineTreeNode> children = new ArrayList<>();
        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent("Name", parentKey));
        textContent.add(new EngineTreeNodeTextContent("Engine path", path));

        EngineTreeNode node = new EngineTreeNode(path, parentKey, pureId, new EngineTreeNodeContext(properties, textContent));
        int childrenSubtreeLength = 0;
        for (int i = 0; i < inputArray.size(); ++i) {
            JsonNode childNode = inputArray.get(i);
            if (childNode == null) {
                throw new IllegalStateException("Unexpected null in json arrayNode");
            }

            EngineTreeNode childTreeNode;
            switch (childNode.getNodeType()) {
                case OBJECT ->
                        childTreeNode = buildJsonObject((ObjectNode) childNode, String.valueOf(i), pureId);
                case ARRAY ->
                        childTreeNode = buildJsonArray((ArrayNode) childNode, String.valueOf(i), pureId);
                case BOOLEAN ->
                        childTreeNode = buildStringValue(childNode.asText(), String.valueOf(i), pureId, "Boolean");
                case NUMBER ->
                        childTreeNode = buildStringValue(childNode.asText(), String.valueOf(i), pureId, "Number");
                default ->
                        childTreeNode = buildStringValue(childNode.asText(), String.valueOf(i), pureId, "String");
            }
            childrenSubtreeLength += childTreeNode.getSubtreeSize();
            children.add(childTreeNode);
        }

        node.setChildren(children);
        node.setSubtreeSize(path.length() + parentKey.length() + childrenSubtreeLength + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
    }

    private EngineTreeNode buildStringValue(String value, String parentKey, String parentId, String type) {
        String pureId = parentId + TREE_PATH_DELIMITER + parentKey;
        String path = makeId(pureId);
        String label = parentKey + " : " + value;

        List<EngineTreeNodeProperty> properties = new ArrayList<>();
        List<EngineTreeNodeTextContent> textContent = new ArrayList<>();
        textContent.add(new EngineTreeNodeTextContent("Name", parentKey));
        textContent.add(new EngineTreeNodeTextContent("Engine path", path));
        properties.add(new EngineTreeNodeProperty("__self", type, value));

        EngineTreeNode node = new EngineTreeNode(path, label, pureId, new EngineTreeNodeContext(properties, textContent));
        node.setSubtreeSize(path.length() + label.length() + TREE_NODE_JSON_LENGTH_OVERHEAD);
        return node;
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
}

