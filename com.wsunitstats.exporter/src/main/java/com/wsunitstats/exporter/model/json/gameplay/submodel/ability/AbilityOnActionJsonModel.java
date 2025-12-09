package com.wsunitstats.exporter.model.json.gameplay.submodel.ability;

import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DistanceJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class AbilityOnActionJsonModel {
    private List<Integer> abilities;
    private DistanceJsonModel distance;
    private Boolean enabled;
    private Boolean onAgro;
    private Integer restore;
    private Boolean strict;
    private Integer action;
}
