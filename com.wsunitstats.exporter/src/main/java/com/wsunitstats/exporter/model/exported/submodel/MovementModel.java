package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.service.serializer.FloatPrecision;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MovementModel {
    // game value / 16, exact (needed to apply research upgrades to it)
    @FloatPrecision(4)
    private Double speed;
    // absent if the unit can't move backwards
    @FloatPrecision(4)
    private Double speedReverse;
    private Double rotationSpeed;
    // speed gained per second (speed units), absent if the unit gets full speed at once
    @FloatPrecision(4)
    private Double acceleration;
    // rotation speed gained per second (rotation speed units), absent if the unit gets full rotation speed at once
    @FloatPrecision(4)
    private Double rotationAcceleration;
    // the unit can't turn on the spot and turns along an arc
    private Boolean smoothTurn;
    private Integer weight;
}
