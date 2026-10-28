package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class DamageJsonModel {
    private Long ang;
    private Integer area;
    private BuffJsonModel buff;
    private Boolean damageFriendly;
    private List<List<Integer>> damages;
    private Integer damagesCount;
    private Integer envDamage;
    private Long envsAffected;
    private Boolean fallingDamage;
    private Integer id;
    @JsonProperty("radius_")
    private Integer radius;
    /** Damage type, armor of the target may have a multiplier for it */
    private Integer type;
}
