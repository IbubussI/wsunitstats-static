package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class ArmorJsonModel {
    /** Armor values with the probability of being hit in the corresponding zone */
    private List<Entry> zonal;
    /** Armor multiplier by damage type (see damage type of weapons), 65536 = 1.0 */
    private Map<Integer, Integer> typed;

    @Getter
    @Setter
    @ToString
    public static class Entry {
        private Integer object;
        private Integer probability;
    }
}
