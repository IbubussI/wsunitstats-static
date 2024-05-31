package com.wsunitstats.exporter.model.exported.submodel.weapon;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ProjectileModel {
    private Integer gameId;
    private Double speed;
    private Double timeToStartCollision;
}
