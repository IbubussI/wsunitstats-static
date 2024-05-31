package com.wsunitstats.exporter.model.exported.submodel.ability;

import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageWrapperModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DamageAbilityModel extends GenericAbility {
    private DamageWrapperModel damage;
}
