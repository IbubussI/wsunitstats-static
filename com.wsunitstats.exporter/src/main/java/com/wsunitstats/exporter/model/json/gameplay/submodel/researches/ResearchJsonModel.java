package com.wsunitstats.exporter.model.json.gameplay.submodel.researches;

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
public class ResearchJsonModel {
    @JsonDeserialize(contentUsing = EntityRefDeserializer.Upgrade.class)
    private List<EntityId> upgrades;
}
