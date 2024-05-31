package com.wsunitstats.exporter.model.exported.submodel.ability.container;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public abstract class GenericAbilityContainer {
    private Integer containerType;
    private String containerName;
}
