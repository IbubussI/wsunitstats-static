package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class HealModel {
    private Double distance;
    private Double perSecond;
    private List<TagModel> targetTags;
    private Double searchNextDistance;
    private Double autoSearchTargetDistance;
    private Double autoSearchTargetPeriod;
}
