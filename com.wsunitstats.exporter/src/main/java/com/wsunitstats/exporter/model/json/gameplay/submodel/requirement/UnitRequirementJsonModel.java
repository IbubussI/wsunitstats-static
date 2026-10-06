package com.wsunitstats.exporter.model.json.gameplay.submodel.requirement;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UnitRequirementJsonModel {
    @JsonDeserialize(using = EntityRefDeserializer.Unit.class)
    private EntityId type;
    private Integer min;
    private Integer max;
}
