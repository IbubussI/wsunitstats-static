package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import static com.wsunitstats.exporter.service.EngineDataBuilder.PROPERTY_JSON_LENGTH_OVERHEAD;

@Getter
public class EngineTreeNodeProperty {
    @JsonProperty("nm")
    private final String name;
    @JsonProperty("tp")
    private final String type;
    @JsonProperty("vl")
    private final String value;
    @JsonIgnore
    private final int jsonSize;

    public EngineTreeNodeProperty(String name,
                                  EngineNodeType type,
                                  String value) {
        this.name = name;
        this.type = type.getLabel();
        this.value = value;
        this.jsonSize = jsonSize();
    }

    private int jsonSize() {
        return name.length() + type.length() + value.length() + PROPERTY_JSON_LENGTH_OVERHEAD * 3;
    }
}
