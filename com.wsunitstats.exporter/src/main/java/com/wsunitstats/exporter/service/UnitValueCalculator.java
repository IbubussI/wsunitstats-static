package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.UnitModel;

public interface UnitValueCalculator {
    double calcScoreValue(UnitModel unit);

    double calcCostValue(UnitModel unit);

    double calcUnitCostValue(UnitModel unit);
}
