package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CollisionJsonModel {
    private Integer elasticity;
    private Long tags;
    private Integer radius;
    private Integer weight;
}
