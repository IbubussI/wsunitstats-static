package com.wsunitstats.exporter.model.exported.submodel.requirement;

import com.wsunitstats.exporter.entity.EntityId;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ResearchRequirementModel {
    private EntityId researchId;
    private String researchName;
    private String researchImage;
}
