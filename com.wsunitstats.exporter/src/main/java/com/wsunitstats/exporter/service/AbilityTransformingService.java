package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.GenericAbilityContainer;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;

import java.util.List;

public interface AbilityTransformingService {
      List<GenericAbilityContainer> transformAbilities(EntityId unitId, UnitJsonModel unitJsonModel);
}
