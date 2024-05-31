package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.wsunitstats.exporter.service.serializer.EnvJsonModelDeserializer;
import com.wsunitstats.exporter.service.serializer.IndexedArrayDataModelSerializer;
import com.wsunitstats.exporter.service.serializer.ProjectileJsonModelDeserializer;
import com.wsunitstats.exporter.service.serializer.UnitJsonModelDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class ScenesJsonModel {
    @JsonDeserialize(using = EnvJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, EnvJsonModel> envs;
    private List<Object> layers;
    private Integer pathFindTime;
    @JsonDeserialize(using = ProjectileJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, ProjectileJsonModel> projectiles;
    @JsonDeserialize(using = UnitJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, UnitJsonModel> units;
}
