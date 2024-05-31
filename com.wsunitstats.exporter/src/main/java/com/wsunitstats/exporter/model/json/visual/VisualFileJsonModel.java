package com.wsunitstats.exporter.model.json.visual;


import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.wsunitstats.exporter.model.json.visual.submodel.UnitTypeJsonModel;
import com.wsunitstats.exporter.service.serializer.IndexedArrayDataModelSerializer;
import com.wsunitstats.exporter.service.serializer.UnitTypeJsonModelDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@ToString
public class VisualFileJsonModel {
    private Object attackOwnTags;
    private Object attackDistance;
    private Object buildPlans;
    private Object buildRules;
    private Object debug;
    private Object envSkins;
    private Object envTypes;
    private Object hotKeys;
    private Object mapEditor;
    private Object particle;
    private Object projectileTypes;
    private Object researches;
    private Object scripts;
    private Object selection;
    private Object statusBars;
    private Object unitSelector;
    private Object unitSkins;
    @JsonDeserialize(using = UnitTypeJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, UnitTypeJsonModel> unitTypes;
    private Object upgradesScripts;
}
