package com.wsunitstats.exporter.model.exported.submodel.ability.container;

import com.wsunitstats.exporter.model.exported.submodel.ability.GenericAbility;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DeathAbilityContainer extends GenericAbilityContainer {
    private GenericAbility ability;
}
