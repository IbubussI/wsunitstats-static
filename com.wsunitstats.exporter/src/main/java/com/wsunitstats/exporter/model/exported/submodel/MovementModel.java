package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MovementModel {
    private Integer speed;
    // absent if the unit can't move backwards
    private Integer speedReverse;
    private Double rotationSpeed;
    private Integer weight;
}
