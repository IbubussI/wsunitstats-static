package com.wsunitstats.exporter.model.json.gameplay.submodel.ability;

import com.wsunitstats.exporter.model.json.gameplay.submodel.requirement.RequirementsJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@ToString
public class AbilityJsonModel {
    private AbilityDataJsonModel data;
    private RequirementsJsonModel requirements;
    private Integer type;

    //Landscape-dependent (requires water - amph tank, deep water - submarine, plain ground - wonder-emma)
    private Map<String, Object> requiredPassability;
}
