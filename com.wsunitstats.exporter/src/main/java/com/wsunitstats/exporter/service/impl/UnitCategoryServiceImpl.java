package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.WorkAbilityContainer;
import com.wsunitstats.exporter.model.exported.submodel.AdditionalClassifiersModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
import com.wsunitstats.exporter.service.UnitCategoryService;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Constants.AdvancedUnitCategory;
import com.wsunitstats.exporter.utils.Constants.SimpleUnitCategory;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityProvider;
import com.wsunitstats.exporter.entity.EntityReferences;
import com.wsunitstats.exporter.service.FileContentService;
import jakarta.annotation.PostConstruct;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;

import static com.wsunitstats.exporter.utils.Constants.GROUND_COMBAT_VEHICLE_EXTRA_UNITS;
import static com.wsunitstats.exporter.utils.Constants.WALL_UNITS;

@Service
public class UnitCategoryServiceImpl implements UnitCategoryService {
    /** Unit tag "Land forces" */
    private static final int LAND_FORCES_TAG = 15;
    /** Categories by unit reference, resolved by the unit provider */
    private static final Map<String, SimpleUnitCategory> SIMPLE_EXCEPTION_UNITS = new HashMap<>();
    private static final Map<String, AdvancedUnitCategory> ADVANCED_EXCEPTION_UNITS = new HashMap<>();

    static {
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/4/university", SimpleUnitCategory.ECO_BUILDING);
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/3/aw/elephant_depot", SimpleUnitCategory.WORKER); // cargo elephant
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/4/ind/truck", SimpleUnitCategory.LAND); // fury of durga
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/4/de/agent_placer", SimpleUnitCategory.LAND); // Goliath operator
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/4/de/agent", SimpleUnitCategory.LAND); // Goliath
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/3/ew/scout", SimpleUnitCategory.LAND);
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/1/pathfinder", SimpleUnitCategory.LAND);
        SIMPLE_EXCEPTION_UNITS.put("WarSelection/4/pl/saboteur", SimpleUnitCategory.LAND);

        ADVANCED_EXCEPTION_UNITS.put("WarSelection/4/university", AdvancedUnitCategory.ECO_BUILDING);
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/3/aw/elephant_depot", AdvancedUnitCategory.WORKER); // cargo elephant
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/4/ind/truck", AdvancedUnitCategory.LAND); // fury of durga
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/4/de/agent_placer", AdvancedUnitCategory.LAND); // Goliath operator
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/4/de/agent", AdvancedUnitCategory.LAND); // Goliath
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/3/ew/scout", AdvancedUnitCategory.LAND);
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/1/pathfinder", AdvancedUnitCategory.LAND);
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/4/pl/saboteur", AdvancedUnitCategory.LAND);
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/2/a/tower_scout", AdvancedUnitCategory.SECONDARY_BUILDING); // observation tower
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/4/engineer", AdvancedUnitCategory.OTHER);
        ADVANCED_EXCEPTION_UNITS.put("WarSelection/5/doctor", AdvancedUnitCategory.OTHER); // medic
    }

    @Autowired
    private FileContentService fileContentService;

    private Map<EntityId, SimpleUnitCategory> simpleExceptions;
    private Map<EntityId, AdvancedUnitCategory> advancedExceptions;
    private Set<EntityId> wallUnits;
    private Set<EntityId> groundCombatVehicleExtraUnits;
    /** Damage type of a weapon's damage against land forces; the damage of anti-aircraft weapons against it is 0 */
    private String landForcesDamageType;

    @PostConstruct
    protected void postConstruct() {
        EntityProvider<?> units = fileContentService.getUnits();
        simpleExceptions = EntityReferences.resolveKeys(units, SIMPLE_EXCEPTION_UNITS);
        advancedExceptions = EntityReferences.resolveKeys(units, ADVANCED_EXCEPTION_UNITS);
        wallUnits = EntityReferences.resolveAll(units, WALL_UNITS);
        groundCombatVehicleExtraUnits = EntityReferences.resolveAll(units, GROUND_COMBAT_VEHICLE_EXTRA_UNITS);
        landForcesDamageType = fileContentService.getLocalizationKeyModel().getUnitTagNames().get(LAND_FORCES_TAG);
    }

    @Override
    public AdditionalClassifiersModel getAdditionalClassifiers(UnitModel unit) {
        AdditionalClassifiersModel classifiers = new AdditionalClassifiersModel();
        classifiers.setGroundCombatVehicle(isGroundCombatVehicle(unit));
        return classifiers;
    }

    /**
     * Tanks, armored cars, APCs and other armed land vehicles: units with a turret that can hit land units,
     * tagged as equipment and land forces, plus the exceptions the rule misses
     */
    private boolean isGroundCombatVehicle(UnitModel unit) {
        if (groundCombatVehicleExtraUnits.contains(unit.getGameId())) {
            return true;
        }
        return equipmentPredicate.test(unit) && landForcesPredicate.test(unit) && CollectionUtils.isNotEmpty(unit.getTurrets())
                && unit.getTurrets().stream()
                .filter(turret -> turret.getWeapons() != null)
                .flatMap(turret -> turret.getWeapons().stream())
                .anyMatch(this::hitsLandForces);
    }
    /** A weapon hits land forces unless its damage against them is set to 0 (anti-aircraft weapons) */
    private boolean hitsLandForces(WeaponModel weapon) {
        if (weapon.getDamage() == null || weapon.getDamage().getDamages() == null) {
            return true;
        }
        return weapon.getDamage().getDamages().stream()
                .noneMatch(damage -> landForcesDamageType.equals(damage.getType()) && damage.getValue() != null && damage.getValue() == 0);
    }

    @Override
    public SimpleUnitCategory getSimpleUnitCategory(UnitModel unit) {
        if (simpleExceptionPredicate.test(unit)) {
            return simpleExceptions.get(unit.getGameId());
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
            return advancedExceptions.get(unit.getGameId());
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
    private final Predicate<UnitModel> equipmentPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == 13);
    private final Predicate<UnitModel> landForcesPredicate = unit -> unit.getTags().stream().anyMatch(tag -> tag.getGameId() == LAND_FORCES_TAG);

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

    private final Predicate<UnitModel> wallPredicate = unit -> wallUnits.contains(unit.getGameId());
    private final Predicate<UnitModel> landCapturePredicate = unit -> unit.getSearchTags().stream().anyMatch(tag -> tag.getGameId() == 7); // land capture
    private final Predicate<UnitModel> attackPredicate = unit -> CollectionUtils.isNotEmpty(unit.getWeapons()) || CollectionUtils.isNotEmpty(unit.getTurrets());

    private final Predicate<UnitModel> simpleExceptionPredicate = unit -> simpleExceptions.containsKey(unit.getGameId());
    private final Predicate<UnitModel> advancedExceptionPredicate = unit -> advancedExceptions.containsKey(unit.getGameId());
}
