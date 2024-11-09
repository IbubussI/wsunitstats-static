package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

import static com.wsunitstats.exporter.service.EngineDataBuilder.CONTAINER_ITEM_JSON_LENGTH_OVERHEAD;
import static com.wsunitstats.exporter.service.EngineDataBuilder.CONTAINER_JSON_LENGTH_OVERHEAD;

@Getter
public class EngineTreeNodeContext {
    @JsonProperty("pr")
    private final List<EngineTreeNodeProperty> properties;
    @JsonProperty("tc")
    private final List<EngineTreeNodeTextContent> textContent;
    @JsonIgnore
    private final int jsonSize;

    public EngineTreeNodeContext() {
        this.properties = new ArrayList<>();
        this.textContent = new ArrayList<>();
        this.jsonSize = jsonSize();
    }

    public EngineTreeNodeContext(List<EngineTreeNodeProperty> properties,
                                 List<EngineTreeNodeTextContent> textContent) {
        this.properties = properties;
        this.textContent = textContent;
        this.jsonSize = jsonSize();
    }

    private int jsonSize() {
        int result = CONTAINER_JSON_LENGTH_OVERHEAD * 2;
        for (EngineTreeNodeProperty property : properties) {
            result += property.getJsonSize() + CONTAINER_ITEM_JSON_LENGTH_OVERHEAD;
        }
        for (EngineTreeNodeTextContent textContentItem : textContent) {
            result += textContentItem.jsonSize() + CONTAINER_ITEM_JSON_LENGTH_OVERHEAD;
        }
        return result;
    }
}
