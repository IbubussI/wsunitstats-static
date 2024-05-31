package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class ArmorJsonModel {
    private List<Entry> data;
    private Integer type;

    @Getter
    @Setter
    @ToString
    public static class Entry {
        private Integer object;
        private Integer probability;
    }
}
