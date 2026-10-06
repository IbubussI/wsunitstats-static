package com.wsunitstats.exporter.model.exported;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.exported.submodel.NationModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class EntityInfoModel {
    private String entityName;
    private EntityId entityId;
    private String entityImage;
    // Nation is optional
    private NationModel entityNation;
}
