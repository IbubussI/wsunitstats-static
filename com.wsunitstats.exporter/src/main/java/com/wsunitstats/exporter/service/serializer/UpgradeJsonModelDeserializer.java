package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.UpgradeJsonModel;

public class UpgradeJsonModelDeserializer extends IndexedArrayDataModelDeserializer<UpgradeJsonModel> {
    @Override
    protected Class<UpgradeJsonModel> getValueClass() {
        return UpgradeJsonModel.class;
    }
}
