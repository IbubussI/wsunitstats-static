package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class ZoneEventJsonModel {
    private List<Integer> abilities;
    private Integer envSearchDistance;
    private Long envTags;
    private Integer levels;
    private Integer size;
}
