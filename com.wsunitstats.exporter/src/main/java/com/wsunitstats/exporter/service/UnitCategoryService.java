package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.AdditionalClassifiersModel;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Constants.SimpleUnitCategory;

public interface UnitCategoryService {
    SimpleUnitCategory getSimpleUnitCategory(UnitModel unit);

    Constants.AdvancedUnitCategory getAdvancedUnitCategory(UnitModel unit);

    /**
     * @return unit classes the game has no tag for: ground combat vehicles
     */
    AdditionalClassifiersModel getAdditionalClassifiers(UnitModel unit);
}
