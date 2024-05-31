package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BuildingJsonModel {
    private Integer angle;
    private Integer distance;
    private Integer id;
    // ticks for 1 hp
    private Integer progress;
    private Integer progressTerritory;
}
