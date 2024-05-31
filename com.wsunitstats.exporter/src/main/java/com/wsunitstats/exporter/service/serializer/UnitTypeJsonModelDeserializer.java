package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.visual.submodel.UnitTypeJsonModel;

public class UnitTypeJsonModelDeserializer extends IndexedArrayDataModelDeserializer<UnitTypeJsonModel> {
    @Override
    protected Class<UnitTypeJsonModel> getValueClass() {
        return UnitTypeJsonModel.class;
    }
}
