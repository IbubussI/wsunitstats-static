package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class WeaponJsonModel {
    private Integer angle;
    private Boolean autoAttack;
    private Integer attackscount;
    private Integer charges;
    private DamageJsonModel damage;
    private DirectionAttacksJsonModel directionAttacks;
    private DistanceJsonModel distance;
    private Boolean enabled;
    private Integer finishHeight;
    private Integer projectile;
    private Integer rechargePeriod;
    @JsonProperty("spread_")
    private Integer spread;
}
