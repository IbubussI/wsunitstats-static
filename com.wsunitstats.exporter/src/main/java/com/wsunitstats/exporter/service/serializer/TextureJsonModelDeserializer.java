package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.main.submodel.TextureJsonModel;

public class TextureJsonModelDeserializer extends IndexedArrayDataModelDeserializer<TextureJsonModel> {
    @Override
    protected Class<TextureJsonModel> getValueClass() {
        return TextureJsonModel.class;
    }
}
