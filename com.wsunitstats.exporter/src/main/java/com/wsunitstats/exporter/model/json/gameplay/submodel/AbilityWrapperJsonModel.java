package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.wsunitstats.exporter.model.json.gameplay.submodel.ability.AbilityJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ability.AbilityOnActionJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.work.WorkJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class AbilityWrapperJsonModel {
    private List<AbilityJsonModel> abilities;
    private AbilityOnActionJsonModel abilityOnAction;
    private List<Object> rally;
    private List<WorkJsonModel> work;
    private Integer abilityOnDeath;
}