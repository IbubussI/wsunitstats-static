package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@ToString
public class ResearchIconsFileModel {
    /** Interface image asset (e.g. "WarSelection/icons/units/1/shared#upgrade0.png") by research id */
    private Map<Integer, String> researchIcons;
}
