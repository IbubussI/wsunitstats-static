package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class DirectionAttacksJsonModel {
    private List<Object> container;
    private DirectionAttacksDefaultValueJsonModel defaultValue;
}
