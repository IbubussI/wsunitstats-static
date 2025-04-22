package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class UnitSourceModel {
    /**
     * cost of the whole creation/transformation chain if applicable or null
     * might be imprecise if one of unit parents has multiple costs
     */
    private List<ResourceModel> fullChainCost;
    /**
     * cost of direct (last) creation/transformation
     */
    private List<ResourceModel> cost;
    private EntityInfoModel sourceInfo;
    private String sourceType;
}
