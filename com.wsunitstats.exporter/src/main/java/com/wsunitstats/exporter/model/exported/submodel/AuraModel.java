package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class AuraModel {
    private Integer auraId;
    private Double radius;
    /** researches the units in the radius get */
    private List<EntityInfoModel> researches;
    /** empty - all units */
    private List<TagModel> affectedUnits;
    /** only units with such an attack are affected, e.g. "projectile" */
    private String affectedAttack;
    private boolean affectsAllies;
    private boolean affectsEnemies;
}
