package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import static com.wsunitstats.exporter.service.EngineDataBuilder.PROPERTY_JSON_LENGTH_OVERHEAD;

@Getter
public class EngineTreeNodeTextContent {
    @JsonProperty("nm")
    private final String name;
    @JsonProperty("tx")
    private final String text;
    @JsonIgnore
    private final int jsonSize;

    public EngineTreeNodeTextContent(String name, String text) {
        this.name = name;
        this.text = text;
        this.jsonSize = jsonSize();
    }

    public int jsonSize() {
        return name.length() + text.length() + PROPERTY_JSON_LENGTH_OVERHEAD * 2;
    }
}
