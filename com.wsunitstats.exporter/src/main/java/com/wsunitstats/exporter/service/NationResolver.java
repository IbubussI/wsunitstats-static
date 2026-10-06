package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.exported.submodel.NationModel;

public interface NationResolver {
    NationModel getUnitNation(EntityId unitId);
}
