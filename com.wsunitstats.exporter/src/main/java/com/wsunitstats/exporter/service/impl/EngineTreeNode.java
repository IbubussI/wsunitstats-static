package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.wsunitstats.exporter.service.serializer.EngineTreeNodeSerializer;
import lombok.Getter;
import lombok.Setter;

import java.util.Comparator;
import java.util.List;

/**
 * Node of the engine data tree. Only the key of the node is stored: the UI builds the node path from the keys of its parents,
 * all the node details are derived from its key, type, value and children
 */
@JsonSerialize(using = EngineTreeNodeSerializer.class)
@Getter
@Setter
public class EngineTreeNode {
    private static final Comparator<EngineTreeNode> KEY_COMPARATOR =
            Comparator.comparing(EngineTreeNode::getKey, new TreeStringComparator());

    private final String key;
    // value of a leaf: string, number, boolean, function args, active tags; the target path of a link
    private final String value;
    private final String type;
    private boolean isExpanded;
    private Boolean isAsync;
    private List<EngineTreeNode> children;
    // estimated json length of the node with its subtree, to split the tree into files
    private int subtreeSize;

    public EngineTreeNode(String key, String value, EngineNodeType type) {
        this.key = key;
        this.value = value;
        this.type = type.getId();
    }

    public void setChildren(List<EngineTreeNode> children) {
        this.children = children.stream().sorted(KEY_COMPARATOR).toList();
    }
}
