package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class SubmarineDepthModel {
    private Double underwaterTime;
    private Double swimDepth;
    private Integer abilityOnFuelEnd;
    private Integer ascensionSpeed;
}