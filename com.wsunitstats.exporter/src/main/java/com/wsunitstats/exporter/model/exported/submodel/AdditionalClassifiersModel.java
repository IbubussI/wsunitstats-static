package com.wsunitstats.exporter.model.exported.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Unit classes the game has no tag for, derived from the unit data
 */
@Getter
@Setter
@ToString
public class AdditionalClassifiersModel {
    // tanks, armored cars, APCs and other armed land vehicles
    @JsonProperty("isGroundCombatVehicle")
    private boolean groundCombatVehicle;
}
