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
public class AttackJsonModel {
    private Map<String, Object> agro;
    private List<TurretJsonModel> turrets;
    private List<WeaponJsonModel> weapons;
    private Integer weaponUseOnDeath;
}
