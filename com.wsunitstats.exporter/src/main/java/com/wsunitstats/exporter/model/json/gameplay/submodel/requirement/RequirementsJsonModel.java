package com.wsunitstats.exporter.model.json.gameplay.submodel.requirement;

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
public class RequirementsJsonModel {
    private List<UnitRequirementJsonModel> units;
    @JsonDeserialize(contentUsing = EntityRefDeserializer.Research.class)
    private List<EntityId> researchAny;
    @JsonDeserialize(contentUsing = EntityRefDeserializer.Research.class)
    private List<EntityId> researchAll;
    private Boolean unitsAll;
}
