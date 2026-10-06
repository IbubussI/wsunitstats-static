package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;


@Getter
@Setter
@ToString
public class WeaponJsonModel {
    /** Abilities the weapon is used by */
    private List<Integer> abilities;
    private Long ang;
    private Boolean autoAttack;
    private Integer attackscount;
    private Integer charges;
    private DamageJsonModel damage;
    private DirectionAttacksJsonModel directionAttacks;
    private DistanceJsonModel distance;
    private Object elevation;
    private Boolean enabled;
    private Integer finishHeight;
    @JsonDeserialize(using = EntityRefDeserializer.Projectile.class)
    private EntityId projectile;
    private Integer rechargePeriod;
    @JsonProperty("spread_")
    private Integer spread;
}
