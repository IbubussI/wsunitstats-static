package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.submodel.NationModel;

public interface NationResolver {
    NationModel getUnitNation(int unitId);
}
