package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.main.submodel.ImageJsonModel;

public class ImageJsonModelDeserializer extends IndexedArrayDataModelDeserializer<ImageJsonModel> {
    @Override
    protected Class<ImageJsonModel> getValueClass() {
        return ImageJsonModel.class;
    }
}
