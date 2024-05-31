package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.WeaponJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class TurretJsonModel {
    private Object aimer;
    private Integer defaultDirection;
    private Integer idleMode;
    private Map<String, Object> maxDeviation;
    private List<Integer> parentPoint;
    private Integer rotationSpeed;
    private Integer scale;
    private List<WeaponJsonModel> weapons;
}
