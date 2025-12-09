package com.wsunitstats.exporter.model.exported.submodel;

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
    private RequirementsModel requirements;
    private List<ResourceModel> healCost;
    private IncomeModel income;
    private Double initHealth;
}
