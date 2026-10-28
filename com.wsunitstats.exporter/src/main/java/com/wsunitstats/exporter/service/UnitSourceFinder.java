package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.BuildingModel;
import com.wsunitstats.exporter.model.exported.submodel.ConstructionModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import com.wsunitstats.exporter.model.exported.submodel.UnitSourceModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.CreateUnitAbilityModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.IconAbilityModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.TransformAbilityModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.DeathAbilityContainer;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.GenericAbilityContainer;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.IconAbilityContainer;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.WorkAbilityContainer;
import com.wsunitstats.exporter.model.exported.submodel.requirement.RequirementsModel;
import com.wsunitstats.exporter.utils.Constants.UnitCostSourceType;
import com.wsunitstats.exporter.utils.Utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

public class UnitSourceFinder {
    // inner map here required to avoid repeats when calc upgrade sources in several iterations
    public Map<EntityId, List<UnitSourceModel>> sourcesLookupMap = new HashMap<>();

    public UnitSourceFinder(List<UnitModel> units) {
        // collect map of unit builders in format <building ID: list of units that can construct it>
        Map<EntityId, List<EntityInfoModel>> buildersMap = new HashMap<>();
        units.forEach(unit -> {
            List<ConstructionModel> constructions = unit.getConstruction();
            if (constructions != null) {
                constructions.stream()
                        .filter(construction -> construction.getEntityInfo() != null)
                        .forEach(construction -> addToMap(buildersMap, construction.getEntityInfo().getEntityId(), toEntityInfo(unit)));
            }
        });

        // initial walkthrough to collect create/build sources
        units.forEach(unit -> {
            EntityInfoModel entityInfo = toEntityInfo(unit);

            // add create ability sources
            forEachWorkAbility(unit, CreateUnitAbilityModel.class, workAbilityContainer -> {
                CreateUnitAbilityModel ability = (CreateUnitAbilityModel) workAbilityContainer.getAbility();
                List<ResourceModel> cost = workAbilityContainer.getWork().getCost();
                int count = ability.getCount() != null ? ability.getCount() : 1;
                List<ResourceModel> singleCost = toSingleCost(cost, count);
                UnitSourceModel unitSourceModel = createSource(UnitCostSourceType.CREATE, entityInfo, ability.getRequirements());
                unitSourceModel.setCost(singleCost);
                addToMap(sourcesLookupMap, ability.getEntityInfo().getEntityId(), unitSourceModel);
            });

            // add build sources, one per builder
            BuildingModel buildingModel = unit.getBuild();
            if (buildingModel != null && buildingModel.getFullCost() != null) {
                List<EntityInfoModel> builders = buildersMap.getOrDefault(unit.getGameId(), new ArrayList<>());
                if (builders.isEmpty()) {
                    builders.add(null);
                }
                builders.forEach(builder -> {
                    UnitSourceModel unitSourceModel = createSource(UnitCostSourceType.BUILDING, builder, buildingModel.getRequirements());
                    unitSourceModel.setCost(buildingModel.getFullCost());
                    addToMap(sourcesLookupMap, unit.getGameId(), unitSourceModel);
                });
            }
        });

        // collect transform ability sources, their full chain cost is set when the cheapest costs are known
        Map<EntityId, List<UnitSourceModel>> transformSourcesMap = new HashMap<>();
        List<Transformation> transformations = new ArrayList<>();
        units.forEach(unit -> {
            EntityInfoModel entityInfo = toEntityInfo(unit);
            forEachWorkAbility(unit, TransformAbilityModel.class, workAbilityContainer -> {
                TransformAbilityModel ability = (TransformAbilityModel) workAbilityContainer.getAbility();
                UnitSourceModel unitSourceModel = createSource(UnitCostSourceType.TRANSFORM, entityInfo, ability.getRequirements());
                unitSourceModel.setCost(workAbilityContainer.getWork().getCost());
                EntityId childId = ability.getEntityInfo().getEntityId();
                addToMap(transformSourcesMap, childId, unitSourceModel);
                transformations.add(new Transformation(unit.getGameId(), childId, unitSourceModel));
            });
        });

        Map<EntityId, List<ResourceModel>> cheapestCosts = new HashMap<>();
        Map<EntityId, Transformation> cheapestLastSteps = new HashMap<>();
        findCheapestCosts(transformations, cheapestCosts, cheapestLastSteps);
        Map<EntityId, Set<EntityId>> unitParentsMap = new HashMap<>();
        transformations.forEach(transformation -> unitParentsMap
                .computeIfAbsent(transformation.childId(), k -> new LinkedHashSet<>())
                .add(transformation.parentId()));
        transformations.forEach(transformation -> {
            UnitSourceModel source = transformation.source();
            // a parent nobody can obtain gives the cost of the transformation only
            source.setFullChainCost(Utils.addResources(source.getCost(), cheapestCosts.get(transformation.parentId())));
            List<Transformation> steps = findCheapestSteps(transformation, cheapestLastSteps);
            source.setFullChainRoute(steps.stream().map(step -> step.source().getSourceInfo()).toList());
            Set<EntityId> visited = new HashSet<>(Set.of(transformation.childId(), transformation.parentId()));
            source.setFullChainRouteHasAlternatives(countRoutes(transformation.parentId(), unitParentsMap, visited, 2) > 1);
        });

        // free sources are added last: they have no cost to search the cheapest parent cost among
        Map<EntityId, List<UnitSourceModel>> freeSourcesMap = new HashMap<>();
        units.forEach(unit -> {
            EntityInfoModel entityInfo = toEntityInfo(unit);
            List<GenericAbilityContainer> abilities = unit.getAbilities();
            if (abilities == null) {
                return;
            }

            // add units appearing on death
            abilities.stream()
                    .filter(abilityContainer -> abilityContainer instanceof DeathAbilityContainer)
                    .map(abilityContainer -> ((DeathAbilityContainer) abilityContainer).getAbility())
                    .filter(ability -> ability instanceof CreateUnitAbilityModel)
                    .map(ability -> (CreateUnitAbilityModel) ability)
                    .filter(ability -> ability.getEntityInfo() != null)
                    .forEach(ability -> addToMap(freeSourcesMap, ability.getEntityInfo().getEntityId(),
                            createSource(UnitCostSourceType.DEATH, entityInfo, ability.getRequirements())));

            // add units created by weapons
            abilities.stream()
                    .filter(abilityContainer -> abilityContainer instanceof IconAbilityContainer)
                    .map(abilityContainer -> ((IconAbilityContainer) abilityContainer).getAbilities())
                    .filter(iconAbilities -> iconAbilities != null)
                    .flatMap(List::stream)
                    .map(IconAbilityModel::getCreatedUnit)
                    .filter(createdUnit -> createdUnit != null)
                    .forEach(createdUnit -> addToMap(freeSourcesMap, createdUnit.getEntityId(),
                            createSource(UnitCostSourceType.WEAPON, entityInfo, null)));
        });

        mergeSourceMaps(sourcesLookupMap, transformSourcesMap);
        mergeSourceMaps(sourcesLookupMap, freeSourcesMap);
    }

    private static EntityInfoModel toEntityInfo(UnitModel unit) {
        EntityInfoModel entityInfo = new EntityInfoModel();
        entityInfo.setEntityId(unit.getGameId());
        entityInfo.setEntityImage(unit.getImage());
        entityInfo.setEntityNation(unit.getNation());
        entityInfo.setEntityName(unit.getName());
        return entityInfo;
    }

    private static UnitSourceModel createSource(UnitCostSourceType type, EntityInfoModel sourceInfo, RequirementsModel requirements) {
        UnitSourceModel unitSourceModel = new UnitSourceModel();
        unitSourceModel.setSourceType(type.getType());
        unitSourceModel.setSourceInfo(sourceInfo);
        unitSourceModel.setRequirements(requirements);
        return unitSourceModel;
    }

    private static <T> void addToMap(Map<EntityId, List<T>> map, EntityId unitId, T value) {
        map.computeIfAbsent(unitId, k -> new ArrayList<>()).add(value);
    }

    private void mergeSourceMaps(Map<EntityId, List<UnitSourceModel>> target, Map<EntityId, List<UnitSourceModel>> source) {
        source.forEach((m, n) -> {
            target.compute(m, (k, v) -> {
                if (v == null) {
                    return n;
                } else {
                    v.addAll(n);
                    return v;
                }
            });
        });
    }

    private List<ResourceModel> toSingleCost(List<ResourceModel> cost, int num) {
        return cost.stream()
                .map(resourceModel -> {
                    ResourceModel newResModel = new ResourceModel();
                    newResModel.setImage(resourceModel.getImage());
                    newResModel.setResourceName(resourceModel.getResourceName());
                    newResModel.setResourceId(resourceModel.getResourceId());
                    newResModel.setValue(resourceModel.getValue() / num);
                    return newResModel;
                }).toList();
    }

    private <Ability> void forEachWorkAbility(UnitModel unit, Class<Ability> abilityType, Consumer<WorkAbilityContainer> callback) {
        List<GenericAbilityContainer> abilities = unit.getAbilities();
        if (abilities != null) {
            // add upgrade ability sources
            abilities.stream()
                    .filter(abilityContainer -> abilityContainer instanceof WorkAbilityContainer)
                    .map(abilityContainer -> (WorkAbilityContainer) abilityContainer)
                    .filter(workAbilityContainer -> workAbilityContainer.getAbility().getClass() == abilityType)
                    .filter(workAbilityContainer -> workAbilityContainer.getWork().getWorkId() >= 0)
                    .forEach(callback);
        }
    }

    /**
     * Transformation of the parent unit into the child unit by the source ability
     */
    private record Transformation(EntityId parentId, EntityId childId, UnitSourceModel source) {
    }

    /**
     * Finds the cheapest cost of obtaining each unit: by creating or building it, or by any chain of transformations
     * starting from a created or built unit, every transformation cost in the chain included. Costs are relaxed until
     * nothing gets cheaper (Bellman-Ford): costs are not negative, so free cycles (e.g. opening and closing a gate)
     * cannot make a unit cheaper and the search ends. The result does not depend on the order units are processed in.
     *
     * @param cheapestCosts     filled with unit ID to its cheapest cost, units that cannot be obtained are absent
     * @param cheapestLastSteps filled with unit ID to the transformation that gives its cheapest cost,
     *                          units that are cheapest to create or build are absent
     */
    private void findCheapestCosts(List<Transformation> transformations,
                                   Map<EntityId, List<ResourceModel>> cheapestCosts,
                                   Map<EntityId, Transformation> cheapestLastSteps) {
        sourcesLookupMap.forEach((unitId, sources) -> sources.stream()
                .map(UnitSourceModel::getCost)
                .min(Utils.COST_COMPARATOR)
                .ifPresent(cost -> cheapestCosts.put(unitId, cost)));

        boolean changed = true;
        while (changed) {
            changed = false;
            for (Transformation transformation : transformations) {
                List<ResourceModel> parentCost = cheapestCosts.get(transformation.parentId());
                if (parentCost == null) {
                    continue;
                }
                List<ResourceModel> cost = Utils.addResources(transformation.source().getCost(), parentCost);
                List<ResourceModel> childCost = cheapestCosts.get(transformation.childId());
                if (childCost == null || Utils.COST_COMPARATOR.compare(cost, childCost) < 0) {
                    cheapestCosts.put(transformation.childId(), cost);
                    cheapestLastSteps.put(transformation.childId(), transformation);
                    changed = true;
                }
            }
        }
    }

    /**
     * @return transformations of the cheapest route ending with the given one: the first one starts from a created
     * or built unit (or from one that cannot be obtained), each next one starts from the unit the previous one gives
     */
    private List<Transformation> findCheapestSteps(Transformation transformation, Map<EntityId, Transformation> cheapestLastSteps) {
        LinkedList<Transformation> steps = new LinkedList<>();
        steps.add(transformation);
        // costs only get cheaper along the route, so it has no cycles; the set is a guard against an endless loop
        Set<EntityId> visited = new HashSet<>();
        visited.add(transformation.parentId());
        Transformation step = cheapestLastSteps.get(transformation.parentId());
        while (step != null && visited.add(step.parentId())) {
            steps.addFirst(step);
            step = cheapestLastSteps.get(step.parentId());
        }
        return steps;
    }

    /**
     * Counts routes to the unit: by creating or building it, or by turning into it from another unit obtained by
     * a route. Units of a route are not repeated and the visited ones are skipped, so loops (e.g. opening and closing
     * a gate) and routes through the unit the route leads to are not counted
     *
     * @param visited units that cannot be on the route, the unit itself included; restored on return
     * @param limit   counting stops when this number of routes is found
     * @return number of routes, at most the limit
     */
    private int countRoutes(EntityId unitId, Map<EntityId, Set<EntityId>> unitParentsMap, Set<EntityId> visited, int limit) {
        int count = sourcesLookupMap.containsKey(unitId) ? 1 : 0;
        for (EntityId parentId : unitParentsMap.getOrDefault(unitId, Set.of())) {
            if (count >= limit) {
                break;
            }
            if (visited.add(parentId)) {
                count += countRoutes(parentId, unitParentsMap, visited, limit - count);
                visited.remove(parentId);
            }
        }
        return count;
    }

    public List<UnitSourceModel> getUnitSources(EntityId unitId) {
        return sourcesLookupMap.getOrDefault(unitId, new ArrayList<>());
    }
}
