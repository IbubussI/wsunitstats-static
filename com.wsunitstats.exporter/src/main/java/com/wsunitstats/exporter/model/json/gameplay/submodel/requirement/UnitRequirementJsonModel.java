package com.wsunitstats.exporter.model.json.gameplay.submodel.requirement;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UnitRequirementJsonModel {
    private Integer type;
    private Integer min;
    private Integer max;
}
