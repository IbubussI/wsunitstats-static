package com.wsunitstats.exporter.model.exported.submodel.ability.container;

import com.wsunitstats.exporter.model.exported.submodel.DistanceModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.GenericAbility;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class OnActionAbilityContainer extends GenericAbilityContainer {
    private DistanceModel distance;
    private Boolean onAgro;
    private Boolean enabled;
    private Double rechargeTime;
    private List<GenericAbility> abilities;
}
