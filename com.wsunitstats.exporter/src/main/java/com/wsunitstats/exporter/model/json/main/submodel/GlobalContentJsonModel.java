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
public class GlobalContentJsonModel {
    @JsonDeserialize(using = ImageJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, ImageJsonModel> images;
    private Map<Integer, String> imagesNames;
    @JsonDeserialize(using = TextureJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, TextureJsonModel> textures;
}
