package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ProjectileJsonModel {
    private Integer	collisionRadius;
    private Integer collisionTags;
    private Integer collisionTimeToStart;
    private Integer densityUnderwater;
    private Boolean finishOnGroundCollision;
    @JsonProperty("gravity_")
    private Integer gravity;
    private Integer gravityUnderwater;
    private Integer homingAngle;
    private Integer moveDistance;
    private Object passability;
    @JsonProperty("speed_")
    private Integer speed;
}
