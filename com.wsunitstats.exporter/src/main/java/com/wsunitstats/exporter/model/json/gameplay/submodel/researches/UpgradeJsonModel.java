package com.wsunitstats.exporter.model.json.gameplay.submodel.researches;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UpgradeJsonModel {
    private String parameters;
    private Integer program;
    private Integer unit;
}