package com.wsunitstats.exporter.model.json.gameplay.submodel.researches;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.wsunitstats.exporter.service.serializer.IndexedArrayDataModelSerializer;
import com.wsunitstats.exporter.service.serializer.ResearchJsonModelDeserializer;
import com.wsunitstats.exporter.service.serializer.UpgradeJsonModelDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@ToString
public class ResearchesJsonModel {
    @JsonDeserialize(using = ResearchJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, ResearchJsonModel> list;
    @JsonDeserialize(using = UpgradeJsonModelDeserializer.class)
    @JsonSerialize(using = IndexedArrayDataModelSerializer.class)
    private Map<Integer, UpgradeJsonModel> upgrades;
}

