package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Armor against a damage type (see damageType of weapons)
 */
@Getter
@Setter
@ToString
public class TypedArmorModel {
    /** Localization key of the damage type (see Constants.DAMAGE_TYPE_NAMES) */
    private String type;
    /** Armor multiplier for the damage type, in percent */
    private Integer probability;
}
