package com.wsunitstats.exporter.model.json.main.submodel;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.wsunitstats.exporter.service.serializer.ImageJsonModelDeserializer;
import com.wsunitstats.exporter.service.serializer.IndexedArrayDataModelSerializer;
import com.wsunitstats.exporter.service.serializer.TextureJsonModelDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@ToString
public class VisualSessionContentJsonModel {
    private Object omniLights;
    private Object atlasses;
    private Object billboards;
    private Object cubeMaps;
    private Object decals;
    private Object droplets;
    @JsonDeserialize(using = ImageJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, ImageJsonModel> images;
    private Object imagesNames;
    private Object interfaceBillboards;
    private Object lenses;
    private Object light;
    private Object models;
    private Object precipitations;
    private Object targets;
    private Object texts;
    @JsonDeserialize(using = TextureJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, TextureJsonModel> textures;
}
