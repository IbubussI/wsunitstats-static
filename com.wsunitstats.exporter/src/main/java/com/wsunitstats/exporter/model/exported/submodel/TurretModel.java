package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class TurretModel {
    private int turretId;
    private Double rotationSpeed;
    private List<WeaponModel> weapons;
}
