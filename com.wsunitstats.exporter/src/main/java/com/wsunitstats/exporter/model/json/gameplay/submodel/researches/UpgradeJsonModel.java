package com.wsunitstats.exporter.model.json.gameplay.submodel.researches;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UpgradeJsonModel {
    private String parameters;
    private Integer program;
    @JsonDeserialize(using = EntityRefDeserializer.Unit.class)
    private EntityId unit;
}
