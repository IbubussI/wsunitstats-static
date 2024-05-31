package com.wsunitstats.exporter.model.json.gameplay.submodel.air;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AerodromeJsonModel {
    private Integer healingSpeed;
    private Integer rechargingPeriod;
    private Integer refuelingSpeed;
    private Integer searchDistance;
    private Long tags;
}
