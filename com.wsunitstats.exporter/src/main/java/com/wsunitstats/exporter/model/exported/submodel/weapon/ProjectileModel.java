package com.wsunitstats.exporter.model.exported.submodel.weapon;

import com.wsunitstats.exporter.entity.EntityId;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ProjectileModel {
    private EntityId gameId;
    private Double speed;
    private Double timeToStartCollision;
}
