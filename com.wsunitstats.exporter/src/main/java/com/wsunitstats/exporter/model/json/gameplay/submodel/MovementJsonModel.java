package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wsunitstats.exporter.model.json.gameplay.submodel.air.AirplaneJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class MovementJsonModel {
    private AirplaneJsonModel airplane;
    private List<BuildingJsonModel> building;
    private CollisionJsonModel collision;
    private Map<String, Object> holdPassability;
    private List<GatherJsonModel> gather;
    private Integer moveAngle;
    private Integer pathTracker;
    private Integer radius;
    private Map<String, Object> randomMove;
    private Integer rotationSpeed;
    private Boolean runOnDamage;
    @JsonProperty("speed_")
    private Integer speed;
    private TransportingJsonModel transporting;
    private Integer weight;
}
