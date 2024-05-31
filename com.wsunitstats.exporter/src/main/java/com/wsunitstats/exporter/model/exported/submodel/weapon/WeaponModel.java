package com.wsunitstats.exporter.model.exported.submodel.weapon;

import com.wsunitstats.exporter.model.exported.submodel.DistanceModel;
import com.wsunitstats.exporter.service.serializer.FloatPrecision;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class WeaponModel {
    private int weaponId;
    private String weaponType;
    private Boolean autoAttack;
    private Boolean attackGround;
    private DistanceModel distance;
    private Boolean enabled;
    private ProjectileModel projectile;
    private Double rechargePeriod;
    private Double spread;
    private Double angle;
    private DamageWrapperModel damage;

    // Bombers specific
    private Integer charges;

    // For melee attacks and shotguns
    private int attacksPerAttack;
    // For machine-guns
    private int attacksPerAction;
    // Time between attack queried and attack performed.
    // Overlaps with recharge time (both start at the same time)
    private Double attackDelay;
    // Time of attack action.
    // Overlaps with recharge time (both start at the same time)
    // Time to empty single cartridge for sequential multi-attack units
    private Double attackTime;
    // Average time for 1 shot for sequential multi-attack units
    private Double avgShotTime;

    @FloatPrecision(3)
    public Double getAttackDelay() {
        return attackDelay;
    }

    @FloatPrecision(3)
    public Double getAttackTime() {
        return attackTime;
    }

    @FloatPrecision(3)
    public Double getAvgShotTime() {
        return avgShotTime;
    }
}
