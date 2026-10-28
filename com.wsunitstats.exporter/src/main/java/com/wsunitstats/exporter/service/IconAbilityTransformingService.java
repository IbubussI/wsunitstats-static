package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.exported.submodel.ability.IconAbilityModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;

import java.util.Collection;
import java.util.List;

public interface IconAbilityTransformingService {
    /**
     * @param otherAbilityIds abilities of the unit outside of the on action, zone event, death and work abilities
     *                        (triggered by weapons or game scripts)
     * @return abilities of the unit shown as icons
     */
    List<IconAbilityModel> transformIconAbilities(EntityId unitId, UnitJsonModel unitJsonModel, Collection<Integer> otherAbilityIds);
}
