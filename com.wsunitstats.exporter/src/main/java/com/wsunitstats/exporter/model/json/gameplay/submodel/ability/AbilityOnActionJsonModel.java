package com.wsunitstats.exporter.model.json.gameplay.submodel.ability;

import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DistanceJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AbilityOnActionJsonModel {
    private Integer ability;
    private DistanceJsonModel distance;
    private Boolean enabled;
    private Boolean onAgro;
    private Integer restore;
}
