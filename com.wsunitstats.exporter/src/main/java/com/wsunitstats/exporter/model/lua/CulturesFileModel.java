package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class CulturesFileModel {
    /** Localization keys of every nation: some nations have a separate key for each of the two periods */
    private List<List<String>> nationNames;
    /** Nation id by unit path */
    private Map<String, Integer> unitNationsByAddress;
}
