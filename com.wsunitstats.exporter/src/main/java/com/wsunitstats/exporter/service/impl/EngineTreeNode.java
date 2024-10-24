package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.wsunitstats.exporter.service.serializer.EngineTreeNodeSerializer;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@JsonSerialize(using = EngineTreeNodeSerializer.class)
@Getter
@Setter
@RequiredArgsConstructor
public class EngineTreeNode implements Comparable<EngineTreeNode> {
    private final String enginePath;
    private final String label;
    private boolean isExpanded;
    private boolean isAsync;
    private List<EngineTreeNode> children;
    private String contextBatch;

    private final String id;
    private final EngineTreeNodeContext context;
    private int subtreeSize;


    @Override
    public int compareTo(EngineTreeNode o) {
        return new TreeStringComparator().compare(label.split(" : ")[0], o.label.split(" : ")[0]);
    }

    public void setChildren(List<EngineTreeNode> children) {
        this.children = children.stream().sorted().toList();
    }
}
