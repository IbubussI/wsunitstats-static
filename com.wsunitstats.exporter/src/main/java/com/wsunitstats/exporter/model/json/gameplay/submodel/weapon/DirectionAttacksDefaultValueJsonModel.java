package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class DirectionAttacksDefaultValueJsonModel {
    private Integer period;
    private List<DirectionAttacksPointJsonModel> points;
}
