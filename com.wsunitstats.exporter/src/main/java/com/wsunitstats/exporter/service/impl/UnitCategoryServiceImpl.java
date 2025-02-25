package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.WorkAbilityContainer;
import com.wsunitstats.exporter.service.UnitCategoryService;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Constants.UnitCategory;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;

import static com.wsunitstats.exporter.utils.Constants.WALL_UNITS;

@Service
public class UnitCategoryServiceImpl implements UnitCategoryService {
    public static final Map<Integer, UnitCategory> EXCEPTIONS = new HashMap<>();

    static {
        EXCEPTIONS.put(194, UnitCategory.ECO_BUILDING); // university
    }

    @Override
    public UnitCategory getUnitCategory(UnitModel unit) {
        if (workerPredicate.test(unit)) {
            return UnitCategory.WORKER;
        }
        if (armyPredicate.test(unit)) {
            return UnitCategory.LAND;
        }
        if (airPredicate.test(unit)) {
            return UnitCategory.AIR;
        }
        if (fleetPredicate.test(unit)) {
            return UnitCategory.FLEET;
        }
        if (buildingPredicate.test(unit)
            && nonTownHall.test(unit)
            && (obtainPredicate.test(unit) || popPredicate.test(unit) || incomePredicate.test(unit))
            && exceptionPredicate(UnitCategory.PRODUCTION_BUILDING).test(unit)) {
            return UnitCategory.ECO_BUILDING;
        }
        if (buildingPredicate.test(unit)
            && nonTownHall.test(unit)
            && productionPredicate.test(unit)
            && exceptionPredicate(UnitCategory.ECO_BUILDING).test(unit)) {
            return UnitCategory.PRODUCTION_BUILDING;
        }
        if (buildingPredicate.test(unit)
            && nonTownHall.test(unit)
            && (wallPredicate.test(unit) || landCapturePredicate.test(unit) || attackPredicate.test(unit))
            && exceptionPredicate(UnitCategory.DEFENCE_BUILDING).test(unit)) {
            return UnitCategory.DEFENCE_BUILDING;
        }
        if (buildingPredicate.test(unit)) {
            return UnitCategory.GAMEPLAY_BUILDING;
        }
        return UnitCategory.OTHER;
    }

    private final Predicate<UnitModel> buildingPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 2); // building
    private final Predicate<UnitModel> workerPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 3); // worker
    private final Predicate<UnitModel> armyPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 4); // army
    private final Predicate<UnitModel> airPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 14); // aviation
    private final Predicate<UnitModel> fleetPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 16); // fleet

    private final Predicate<UnitModel> productionPredicate = unit -> unit.getAbilities() != null && unit.getAbilities().stream()
            .filter(container -> container.getContainerType() == Constants.AbilityContainerType.WORK.getType())
            .map(container -> (WorkAbilityContainer) container)
            .map(WorkAbilityContainer::getAbility)
            .anyMatch(ability -> ability.getAbilityType() == Constants.AbilityType.CREATE_UNIT.getType());

    private final Predicate<UnitModel> obtainPredicate = unit -> unit.getSearchTags().stream()
            .anyMatch(tag -> tag.getGameId() == 0 || tag.getGameId() == 1 || tag.getGameId() == 2);
    private final Predicate<UnitModel> popPredicate = unit -> unit.getSupply() != null && unit.getSupply().getProduce() != null && unit.getSupply().getProduce() > 0;
    private final Predicate<UnitModel> incomePredicate = unit -> unit.getBuild() != null && unit.getBuild().getIncome() != null;

    private final Predicate<UnitModel> wallPredicate = unit -> WALL_UNITS.contains(unit.getGameId());
    private final Predicate<UnitModel> landCapturePredicate = unit -> unit.getSearchTags().stream().anyMatch(tag -> tag.getGameId() == 7); // land capture
    private final Predicate<UnitModel> attackPredicate = unit -> CollectionUtils.isNotEmpty(unit.getWeapons()) || CollectionUtils.isNotEmpty(unit.getTurrets());
    private final Predicate<UnitModel> nonTownHall = unit -> unit.getTags().stream().noneMatch(tag -> tag.getGameId() == 5)
                                                             && unit.getSearchTags().stream().noneMatch(tag -> tag.getGameId() == 9);

    private Predicate<UnitModel> exceptionPredicate(UnitCategory category) {
        return unit -> {
            UnitCategory exceptionCategory = EXCEPTIONS.get(unit.getGameId());
            return exceptionCategory == null || category.equals(exceptionCategory);
        };
    }
}
