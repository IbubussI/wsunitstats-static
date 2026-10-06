package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.model.json.gameplay.submodel.requirement.RequirementsJsonModel;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class BuildJsonModel {
    private Boolean available;
    private Integer collision;
    private List<Integer> costBuilding;
    private List<Integer> costInit;
    private Integer health;
    private Integer locationEnvTags;
    private RequirementsJsonModel requirements;
    @JsonDeserialize(using = EntityRefDeserializer.Unit.class)
    private EntityId unit;
    private Boolean wall;
    private Map<String, Object> wallData;
}
