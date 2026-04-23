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
    private Long defaultDir;
    private Integer idleMode;
    private Map<String, Long> maxDev;
    private List<Integer> parentPoint;
    private Long rotationSpd;
    private Integer scale;
    private List<WeaponJsonModel> weapons;
}
