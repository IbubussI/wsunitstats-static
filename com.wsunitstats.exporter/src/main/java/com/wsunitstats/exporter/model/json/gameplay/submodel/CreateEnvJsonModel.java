package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class CreateEnvJsonModel {
    private Integer createEvent;
    private Integer endingLifeTime;
    @JsonDeserialize(using = EntityRefDeserializer.Env.class)
    private EntityId env;
    private Integer probability;
    private Long randomDir;
    private Integer startEndingEvent;
    private String tag;
    private Integer scale;
    private Long dir;
    private Integer count;
    private List<Integer> position;
    private Integer findPositionSize;
}
