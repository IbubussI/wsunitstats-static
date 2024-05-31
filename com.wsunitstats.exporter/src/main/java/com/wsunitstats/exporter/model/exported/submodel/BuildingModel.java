package com.wsunitstats.exporter.model.exported.submodel;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.wsunitstats.exporter.model.exported.submodel.requirement.RequirementsModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class BuildingModel {
    private int buildId;
    private List<ResourceModel> initCost;
    private List<ResourceModel> fullCost;
    @JsonInclude(value = JsonInclude.Include.CUSTOM, valueFilter = RequirementsModel.class)
    private RequirementsModel requirements;
    private List<ResourceModel> healCost;
    private IncomeModel income;
    private Double initHealth;
}
