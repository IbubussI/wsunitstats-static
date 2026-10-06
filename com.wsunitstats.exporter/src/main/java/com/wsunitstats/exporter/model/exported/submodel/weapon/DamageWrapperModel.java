package com.wsunitstats.exporter.model.exported.submodel.weapon;

import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class DamageWrapperModel {
    private Double angle;
    private String areaType;
    private BuffModel buff;
    private Boolean damageFriendly;
    private List<DamageModel> damages;
    // damage type, armor of the target may have a multiplier for it (see armorTyped of units)
    private Integer damageType;
    // Death Scythe specific
    private int damagesCount;
    private Double envDamage;
    private List<TagModel> envsAffected;
    private Double radius;
}
