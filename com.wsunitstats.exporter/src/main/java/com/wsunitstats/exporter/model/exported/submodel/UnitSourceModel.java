package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.model.exported.submodel.requirement.RequirementsModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class UnitSourceModel {
    /**
     * transformations only: cost of the transformation plus the cheapest cost of obtaining the parent
     * (created, built or transformed by any chain); the transformation cost alone if the parent cannot be obtained
     */
    private List<ResourceModel> fullChainCost;
    /**
     * transformations only: units of the cheapest route to the parent, from the first created or built one
     * to the parent itself, in the order they turn into each other
     */
    private List<EntityInfoModel> fullChainRoute;
    /**
     * transformations only: true if the parent can be obtained by more than one route (without loops and without
     * the unit itself), so the cheapest route is a choice among alternatives
     */
    private Boolean fullChainRouteHasAlternatives;
    /**
     * cost of direct (last) creation/transformation, null if the unit is obtained for free (on death, by weapon)
     */
    private List<ResourceModel> cost;
    /**
     * unit that creates, turns into or builds the unit; null for a building nobody can construct
     */
    private EntityInfoModel sourceInfo;
    private String sourceType;
    /**
     * requirements of the parent's ability or of the building itself
     */
    private RequirementsModel requirements;
}
