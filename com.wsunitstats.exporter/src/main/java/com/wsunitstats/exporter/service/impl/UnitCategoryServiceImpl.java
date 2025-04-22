package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.WorkAbilityContainer;
import com.wsunitstats.exporter.service.UnitCategoryService;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Constants.AdvancedUnitCategory;
import com.wsunitstats.exporter.utils.Constants.SimpleUnitCategory;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;

import static com.wsunitstats.exporter.utils.Constants.WALL_UNITS;

@Service
public class UnitCategoryServiceImpl implements UnitCategoryService {
    public static final Map<Integer, SimpleUnitCategory> SIMPLE_EXCEPTIONS = new HashMap<>();
    public static final Map<Integer, AdvancedUnitCategory> ADVANCED_EXCEPTIONS = new HashMap<>();

    static {
        SIMPLE_EXCEPTIONS.put(194, SimpleUnitCategory.ECO_BUILDING); // university
        SIMPLE_EXCEPTIONS.put(124, SimpleUnitCategory.WORKER); // cargo elephant
        SIMPLE_EXCEPTIONS.put(270, SimpleUnitCategory.LAND); // fury of durga
        SIMPLE_EXCEPTIONS.put(288, SimpleUnitCategory.LAND); // Goliath operator
        SIMPLE_EXCEPTIONS.put(289, SimpleUnitCategory.LAND); // Goliath
        SIMPLE_EXCEPTIONS.put(106, SimpleUnitCategory.LAND); // Scout
        SIMPLE_EXCEPTIONS.put(313, SimpleUnitCategory.LAND); // Pathfinder
        SIMPLE_EXCEPTIONS.put(376, SimpleUnitCategory.LAND); // Saboteur

        ADVANCED_EXCEPTIONS.put(194, AdvancedUnitCategory.ECO_BUILDING); // university
        ADVANCED_EXCEPTIONS.put(124, AdvancedUnitCategory.WORKER); // cargo elephant
        ADVANCED_EXCEPTIONS.put(270, AdvancedUnitCategory.LAND); // fury of durga
        ADVANCED_EXCEPTIONS.put(288, AdvancedUnitCategory.LAND); // Goliath operator
        ADVANCED_EXCEPTIONS.put(289, AdvancedUnitCategory.LAND); // Goliath
        ADVANCED_EXCEPTIONS.put(106, AdvancedUnitCategory.LAND); // Scout
        ADVANCED_EXCEPTIONS.put(313, AdvancedUnitCategory.LAND); // Pathfinder
        ADVANCED_EXCEPTIONS.put(376, AdvancedUnitCategory.LAND); // Saboteur
        ADVANCED_EXCEPTIONS.put(46, AdvancedUnitCategory.SECONDARY_BUILDING); // observing tower
        ADVANCED_EXCEPTIONS.put(301, AdvancedUnitCategory.OTHER); // engineer
        ADVANCED_EXCEPTIONS.put(400, AdvancedUnitCategory.OTHER); // medic
    }

    @Override
    public SimpleUnitCategory getSimpleUnitCategory(UnitModel unit) {
        if (simpleExceptionPredicate.test(unit)) {
            return SIMPLE_EXCEPTIONS.get(unit.getGameId());
        }
        if (!buildingPredicate.test(unit)) {
            if (workerPredicate.test(unit)) {
                return SimpleUnitCategory.WORKER;
            }
            if (armyPredicate.test(unit)) {
                return SimpleUnitCategory.LAND;
            }
            if (airPredicate.test(unit)) {
                return SimpleUnitCategory.AIR;
            }
            if (fleetPredicate.test(unit)) {
                return SimpleUnitCategory.FLEET;
            }
        }
        if (buildingPredicate.test(unit)) {
            if (townCenterPredicate.test(unit)) {
                return SimpleUnitCategory.TC;
            }
            if (obtainPredicate.test(unit) || popPredicate.test(unit) || incomePredicate.test(unit)) {
                return SimpleUnitCategory.ECO_BUILDING;
            }
            if (productionPredicate.test(unit)) {
                return SimpleUnitCategory.PRODUCTION_BUILDING;
            }
            if (wallPredicate.test(unit) || landCapturePredicate.test(unit) || attackPredicate.test(unit)) {
                return SimpleUnitCategory.DEFENCE_BUILDING;
            }
            return SimpleUnitCategory.GAMEPLAY_BUILDING;
        }
        return SimpleUnitCategory.OTHER;
    }

    @Override
    public AdvancedUnitCategory getAdvancedUnitCategory(UnitModel unit) {
        if (advancedExceptionPredicate.test(unit)) {
            return ADVANCED_EXCEPTIONS.get(unit.getGameId());
        }
        if (!buildingPredicate.test(unit)) {
            if (workerPredicate.test(unit)) {
                return AdvancedUnitCategory.WORKER;
            }
            if (armyPredicate.test(unit)) {
                return AdvancedUnitCategory.LAND;
            }
            if (airPredicate.test(unit)) {
                return AdvancedUnitCategory.AIR;
            }
            if (fleetPredicate.test(unit)) {
                return AdvancedUnitCategory.FLEET;
            }
        }
        if (buildingPredicate.test(unit)) {
            if (wonderPredicate.test(unit)) {
                return AdvancedUnitCategory.WONDER;
            }
            if (townCenterPredicate.test(unit)) {
                return AdvancedUnitCategory.TC;
            }
            if (popPredicate.test(unit)) {
                return AdvancedUnitCategory.HOUSE;
            }
            if (incomePredicate.test(unit)) {
                return AdvancedUnitCategory.MINE;
            }
            if (templePredicate.test(unit)) {
                return AdvancedUnitCategory.GAMEPLAY_BUILDING;
            }
            if (warehousePredicate.test(unit)) {
                return AdvancedUnitCategory.SECONDARY_BUILDING;
            }
            if (wallPredicate.test(unit)) {
                return AdvancedUnitCategory.WALL;
            }
            if (obtainPredicate.test(unit)) {
                return AdvancedUnitCategory.ECO_BUILDING;
            }
            if (productionPredicate.test(unit)) {
                return AdvancedUnitCategory.PRODUCTION_BUILDING;
            }
            if (landCapturePredicate.test(unit) || attackPredicate.test(unit)) {
                return AdvancedUnitCategory.DEFENCE_BUILDING;
            }
            return AdvancedUnitCategory.GAMEPLAY_BUILDING;
        }
        return AdvancedUnitCategory.OTHER;
    }

    private final Predicate<UnitModel> buildingPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 2);
    private final Predicate<UnitModel> workerPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 3);
    private final Predicate<UnitModel> armyPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 4);
    private final Predicate<UnitModel> airPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 14);
    private final Predicate<UnitModel> fleetPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 16);
    private final Predicate<UnitModel> townCenterPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 5);
    private final Predicate<UnitModel> wonderPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 9);

    private final Predicate<UnitModel> productionPredicate = unit -> unit.getAbilities() != null && unit.getAbilities().stream()
            .filter(container -> container.getContainerType() == Constants.AbilityContainerType.WORK.getType())
            .map(container -> (WorkAbilityContainer) container)
            .map(WorkAbilityContainer::getAbility)
            .anyMatch(ability -> ability.getAbilityType() == Constants.AbilityType.CREATE_UNIT.getType());

    private final Predicate<UnitModel> obtainPredicate = unit -> unit.getSearchTags().stream()
            .anyMatch(tag -> tag.getGameId() == 0 || tag.getGameId() == 1 || tag.getGameId() == 2);
    private final Predicate<UnitModel> warehousePredicate =
            unit -> unit.getSearchTags().stream().anyMatch(tag -> tag.getGameId() == 0)
                    && unit.getSearchTags().stream().anyMatch(tag -> tag.getGameId() == 1)
                    && unit.getSearchTags().stream().anyMatch(tag -> tag.getGameId() == 2);
    private final Predicate<UnitModel> templePredicate = unit -> unit.getSearchTags().stream()
            .anyMatch(tag -> tag.getGameId() == 9); // transition to next age tag
    private final Predicate<UnitModel> popPredicate = unit -> unit.getSupply() != null && unit.getSupply().getProduce() != null && unit.getSupply().getProduce() > 0;
    private final Predicate<UnitModel> incomePredicate = unit -> unit.getBuild() != null && unit.getBuild().getIncome() != null;

    private final Predicate<UnitModel> wallPredicate = unit -> WALL_UNITS.contains(unit.getGameId());
    private final Predicate<UnitModel> landCapturePredicate = unit -> unit.getSearchTags().stream().anyMatch(tag -> tag.getGameId() == 7); // land capture
    private final Predicate<UnitModel> attackPredicate = unit -> CollectionUtils.isNotEmpty(unit.getWeapons()) || CollectionUtils.isNotEmpty(unit.getTurrets());

    private final Predicate<UnitModel> simpleExceptionPredicate = unit -> SIMPLE_EXCEPTIONS.get(unit.getGameId()) != null;
    private final Predicate<UnitModel> advancedExceptionPredicate = unit -> ADVANCED_EXCEPTIONS.get(unit.getGameId()) != null;
}
