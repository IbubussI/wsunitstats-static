package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BuildingJsonModel {
    private Long ang;
    private Integer distance;
    @JsonDeserialize(using = EntityRefDeserializer.Unit.class)
    private EntityId id;
    // building progress added every tick (tickProgress in game scripts), see Constants.BUILDING_PROGRESS_FULL
    private Integer progress;
    private Integer progressTerritory;
}
