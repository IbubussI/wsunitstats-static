package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class EnvJsonModel {
    private List<Object> corpses;
    private String createTag;
    private String envAfterDie;
    @JsonProperty("gatherk_")
    private Integer gatherk;
    private Integer health;
    private Integer lifeTime;
    private Map<String, Object> passability;
    private Integer regeneration;
    private Integer searchTags;
    private Integer size;
    private Integer tags;
    private Boolean tickable;
}
