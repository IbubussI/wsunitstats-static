package com.wsunitstats.exporter.model.exported.submodel.ability;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ResearchAbilityModel extends GenericAbility {
    private EntityInfoModel entityInfo;
}
