package com.wsunitstats.exporter.model.json.gameplay.submodel.weapon;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BuffJsonModel {
    private Integer duration;
    private Integer period;
    private Integer priorityMult;
    @JsonDeserialize(using = EntityRefDeserializer.Research.class)
    private EntityId research;
    private Long targetsTags;
    private Long targetsTagsExclude;
}
