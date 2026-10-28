package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Aura of the unit: index in gameplay.json auras list and its radius
 */
@Getter
@Setter
@ToString
public class UnitAuraJsonModel {
    private Integer aura;
    private Integer radius;
}
