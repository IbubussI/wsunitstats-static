package com.wsunitstats.exporter.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class GroundAttackDataWrapper {
    private boolean isAttackGround;
    // 0 - weapon, 1 - turret
    private Integer weaponTypeDescriptor;
    private Integer weaponId;
}
