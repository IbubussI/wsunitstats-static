package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.gameplay.submodel.UpgradeScriptJsonModel;

public class UpgradesScriptsJsonModelDeserializer extends IndexedArrayDataModelDeserializer<UpgradeScriptJsonModel> {
    @Override
    protected Class<UpgradeScriptJsonModel> getValueClass() {
        return UpgradeScriptJsonModel.class;
    }
}
