package com.wsunitstats.exporter.model.exported.submodel.requirement;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class RequirementsModel {
    private List<UnitRequirementModel> units;
    private Boolean unitsAll;
    private List<ResearchRequirementModel> researchAny;
    private List<ResearchRequirementModel> researchAll;
}
