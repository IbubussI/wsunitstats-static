package com.wsunitstats.exporter.model.exported.submodel.ability;

import com.wsunitstats.exporter.model.exported.submodel.requirement.RequirementsModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public abstract class GenericAbility {
    private int abilityId;
    private int abilityType;
    private String abilityName;
    private RequirementsModel requirements;
}
