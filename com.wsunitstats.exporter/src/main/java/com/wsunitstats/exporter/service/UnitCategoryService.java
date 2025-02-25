package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.utils.Constants.UnitCategory;

public interface UnitCategoryService {
    UnitCategory getUnitCategory(UnitModel unit);
}
