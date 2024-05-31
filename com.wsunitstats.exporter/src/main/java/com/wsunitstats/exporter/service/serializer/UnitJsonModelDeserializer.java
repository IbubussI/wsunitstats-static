package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;

public class UnitJsonModelDeserializer extends IndexedArrayDataModelDeserializer<UnitJsonModel> {
    @Override
    protected Class<UnitJsonModel> getValueClass() {
        return UnitJsonModel.class;
    }
}
