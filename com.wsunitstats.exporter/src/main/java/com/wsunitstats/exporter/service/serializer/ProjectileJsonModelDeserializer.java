package com.wsunitstats.exporter.service.serializer;

import com.wsunitstats.exporter.model.json.gameplay.submodel.ProjectileJsonModel;

public class ProjectileJsonModelDeserializer extends IndexedArrayDataModelDeserializer<ProjectileJsonModel> {
    @Override
    protected Class<ProjectileJsonModel> getValueClass() {
        return ProjectileJsonModel.class;
    }
}
