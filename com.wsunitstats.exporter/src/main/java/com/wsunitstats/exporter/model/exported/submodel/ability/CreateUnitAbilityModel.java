package com.wsunitstats.exporter.model.exported.submodel.ability;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CreateUnitAbilityModel extends EntityAwareAbility {
    private Integer count;
    private Double lifeTime;
}
