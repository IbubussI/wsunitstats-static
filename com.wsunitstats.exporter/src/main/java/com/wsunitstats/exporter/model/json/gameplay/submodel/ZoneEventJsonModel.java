package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Event checked around the unit: either envs it moves through (tanks breaking trees) trigger the abilities,
 * or units around it trigger the work (gates open when own or allied units come close and close when they leave)
 */
@Getter
@Setter
@ToString
public class ZoneEventJsonModel {
    // envs
    private List<Integer> abilities;
    private Integer envSearchDistance;
    private Long envTags;
    private Integer levels;
    @JsonProperty("size_")
    private Integer size;
    private Boolean byHull;

    // units
    private Integer unitSearchDistance;
    private Boolean unitOwn;
    private Boolean unitAlly;
    /** the work is triggered when there are no such units around instead */
    private Boolean unitsAbsent;
    private Integer checkPeriod;
    /** index in the work list */
    private Integer work;
}
