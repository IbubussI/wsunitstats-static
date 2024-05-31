package com.wsunitstats.exporter.model.json.gameplay.submodel.requirement;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class RequirementsJsonModel {
    private List<UnitRequirementJsonModel> units;
    private List<Integer> researches;
    private Boolean researchesAll;
    private Boolean unitsAll;
}
