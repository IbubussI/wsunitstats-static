package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BuffJsonModel {
    private Integer period;
    private Integer research;
    private Long targetsTags;
}
