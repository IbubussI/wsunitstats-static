package com.wsunitstats.exporter.model.exported.submodel.requirement;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.exported.submodel.NationModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
@Getter
@Setter
@ToString
public class UnitRequirementModel {
    private EntityId unitId;
    private String unitName;
    private NationModel unitNation;
    private String unitImage;
    private String quantityStr;
    private int quantityMin;
    private int quantityMax;
}
