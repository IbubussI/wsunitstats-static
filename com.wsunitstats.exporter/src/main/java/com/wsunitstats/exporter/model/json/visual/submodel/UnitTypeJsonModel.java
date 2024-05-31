package com.wsunitstats.exporter.model.json.visual.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UnitTypeJsonModel {
    private Object attack;
    private Object corpses;
    private Object gather;
    private Object healthBar;
    private String externalData;
    private Object occlusion;
    private Object reflection;
    private Object selectionPriority;
    private Object selectionType;
    private Object shadow;
    @JsonProperty("skins_")
    private Object skins;
}
