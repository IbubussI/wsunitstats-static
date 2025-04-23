package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.UnitModel;

public interface UnitValueCalculator {
    double calcKillValue(UnitModel unit);

    double calcUnitCostValue(UnitModel unit);
}
