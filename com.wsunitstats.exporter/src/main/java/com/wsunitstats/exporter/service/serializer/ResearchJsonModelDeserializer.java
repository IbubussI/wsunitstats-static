package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.ResearchJsonModel;

public class ResearchJsonModelDeserializer extends IndexedArrayDataModelDeserializer<ResearchJsonModel> {
    @Override
    protected Class<ResearchJsonModel> getValueClass() {
        return ResearchJsonModel.class;
    }
}
