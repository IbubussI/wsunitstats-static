package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DistanceJsonModel {
    private Integer max;
    private Integer min;
    private Integer stop;
}
