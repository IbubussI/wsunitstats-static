package com.wsunitstats.exporter.model.exported.submodel.research;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import com.wsunitstats.exporter.model.exported.submodel.requirement.RequirementsModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Unit that researches the research by a work ability
 */
@Getter
@Setter
@ToString
public class ResearchSourceModel {
    private EntityInfoModel sourceInfo;
    private List<ResourceModel> cost;
    private Double makeTime;
    /**
     * requirements of the unit's ability
     */
    private RequirementsModel requirements;
}
