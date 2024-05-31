package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class HealJsonModel {
    private Integer angle;
    private Integer distance;
    private Integer minimumTime;
    private Integer perTick;
    private Integer searchNextDistance;
    private Integer autoSearchTargetDistance;
    private Integer autoSearchTargetPeriod;
    private Long targetTags;
}
