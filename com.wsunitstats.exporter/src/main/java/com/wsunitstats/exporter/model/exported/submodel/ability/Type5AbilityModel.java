package com.wsunitstats.exporter.model.exported.submodel.ability;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * ability related to unit dance (e.g. spearman bravado etc)
 */
//@Entity(name = "ability_5")
@Getter
@Setter
@ToString
public class Type5AbilityModel extends GenericAbility {
    private Double duration;
}
