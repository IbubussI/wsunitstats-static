package com.wsunitstats.exporter.model.json.gameplay.submodel.air;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AirplaneJsonModel {
    private AerodromeJsonModel aerodrome;
    private Integer ascensionalRate;
    private Integer fuel;
    private Integer heightAboveSurface;
    private Integer workOnFuelEnd;
    private Boolean moveAsFallDown;
}
