package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class CreateEnvJsonModel {
    private Integer createEvent;
    private Integer endingLifeTime;
    private Integer probability;
    private Integer randomDirection;
    private Integer startEndingEvent;
    private String tag;
    private Integer scale;
    private Integer direction;
    private Integer count;
    private List<Integer> position;
    private Integer findPositionSize;
}
