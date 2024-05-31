package com.wsunitstats.exporter.model.exported.submodel.ability;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CreateUnitAbilityModel extends GenericAbility {
    private Integer count;
    private Double lifeTime;
    private EntityInfoModel entityInfo;
}
