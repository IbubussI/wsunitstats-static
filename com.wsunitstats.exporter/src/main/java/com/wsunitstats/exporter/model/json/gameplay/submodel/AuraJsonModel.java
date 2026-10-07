package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Aura from gameplay.json auras list: units in the radius of the unit with the aura get the research
 */
@Getter
@Setter
@ToString
public class AuraJsonModel {
    private Boolean affectsAlly;
    private Boolean affectsEnemy;
    @JsonDeserialize(using = EntityRefDeserializer.Research.class)
    private EntityId research;
    private Long targetsTags;
}
