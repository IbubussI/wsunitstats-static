package com.wsunitstats.exporter.model.exported.submodel.ability.container;

import com.wsunitstats.exporter.model.exported.submodel.ability.GenericAbility;
import com.wsunitstats.exporter.model.exported.submodel.ability.WorkModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class WorkAbilityContainer extends GenericAbilityContainer {
    private WorkModel work;
    private GenericAbility ability;
}
