package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.BuildingModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import com.wsunitstats.exporter.model.exported.submodel.UnitSourceModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.CreateUnitAbilityModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.TransformAbilityModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.GenericAbilityContainer;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.WorkAbilityContainer;
import com.wsunitstats.exporter.utils.Constants.UnitCostSourceType;
import com.wsunitstats.exporter.utils.Utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public class UnitSourceFinder {
    // inner map here required to avoid repeats when calc upgrade sources in several iterations
    public Map<Integer, List<UnitSourceModel>> sourcesLookupMap = new HashMap<>();

    public UnitSourceFinder(List<UnitModel> units) {
        // initial walkthrough to collect create/build sources
        units.forEach(unit -> {
            EntityInfoModel entityInfo = new EntityInfoModel();
            entityInfo.setEntityId(unit.getGameId());
            entityInfo.setEntityImage(unit.getImage());
            entityInfo.setEntityNation(unit.getNation());
            entityInfo.setEntityName(unit.getName());

            // add create ability sources
            forEachWorkAbility(unit, CreateUnitAbilityModel.class, workAbilityContainer -> {
                CreateUnitAbilityModel ability = (CreateUnitAbilityModel) workAbilityContainer.getAbility();
                List<ResourceModel> cost = workAbilityContainer.getWork().getCost();
                int count = ability.getCount() != null ? ability.getCount() : 1;
                List<ResourceModel> singleCost = toSingleCost(cost, count);
                UnitSourceModel unitSourceModel = new UnitSourceModel();
                unitSourceModel.setSourceInfo(entityInfo);
                unitSourceModel.setSourceType(UnitCostSourceType.ABILITY.getType());
                unitSourceModel.setCost(singleCost);
                addToSourceMap(sourcesLookupMap, ability.getEntityInfo().getEntityId(), unitSourceModel);
            });

            // add build sources
            BuildingModel buildingModel = unit.getBuild();
            if (buildingModel != null && buildingModel.getFullCost() != null) {
                UnitSourceModel unitSourceModel = new UnitSourceModel();
                unitSourceModel.setSourceType(UnitCostSourceType.BUILDING.getType());
                unitSourceModel.setCost(buildingModel.getFullCost());
                addToSourceMap(sourcesLookupMap, unit.getGameId(), unitSourceModel);
            }
        });

        // collect map of unit transformation parents in format <unit ID: list of parent IDs>
        Map<Integer, List<Integer>> unitParentsMap = new HashMap<>();
        units.forEach(unit -> forEachWorkAbility(unit, TransformAbilityModel.class, workAbilityContainer -> {
            TransformAbilityModel ability = (TransformAbilityModel) workAbilityContainer.getAbility();
            int childId = ability.getEntityInfo().getEntityId();
            unitParentsMap.compute(childId, (k, v) -> {
                List<Integer> entry = v == null ? new ArrayList<>() : v;
                entry.add(unit.getGameId());
                return entry;
            });
        }));

        Map<Integer, List<UnitSourceModel>> transformSourcesMap = new HashMap<>();
        units.forEach(unit -> {
            EntityInfoModel entityInfo = new EntityInfoModel();
            entityInfo.setEntityId(unit.getGameId());
            entityInfo.setEntityImage(unit.getImage());
            entityInfo.setEntityNation(unit.getNation());
            entityInfo.setEntityName(unit.getName());

            // add transform ability sources
            forEachWorkAbility(unit, TransformAbilityModel.class, workAbilityContainer -> {
                TransformAbilityModel ability = (TransformAbilityModel) workAbilityContainer.getAbility();
                List<ResourceModel> transformCost = workAbilityContainer.getWork().getCost();
                List<ResourceModel> parentCost = findParentTreeCost(unit.getGameId(), unitParentsMap, new HashMap<>());

                UnitSourceModel unitSourceModel = new UnitSourceModel();
                unitSourceModel.setSourceInfo(entityInfo);
                unitSourceModel.setSourceType(UnitCostSourceType.ABILITY.getType());
                unitSourceModel.setFullChainCost(Utils.addResources(transformCost, parentCost));
                unitSourceModel.setCost(transformCost);
                addToSourceMap(transformSourcesMap, ability.getEntityInfo().getEntityId(), unitSourceModel);
            });
        });

        mergeSourceMaps(sourcesLookupMap, transformSourcesMap);
    }

    private void addToSourceMap(Map<Integer, List<UnitSourceModel>> sourceMap, int unitId, UnitSourceModel unitSourceModel) {
        sourceMap.compute(unitId, (k, v) -> {
            List<UnitSourceModel> entry = v == null ? new ArrayList<>() : v;
            entry.add(unitSourceModel);
            return entry;
        });
    }

    private void mergeSourceMaps(Map<Integer, List<UnitSourceModel>> target, Map<Integer, List<UnitSourceModel>> source) {
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

    private List<ResourceModel> findParentTreeCost(int unitId, Map<Integer, List<Integer>> unitParentsMap, Map<String, Boolean> visitedMap) {
        List<UnitSourceModel> currentCreateSources = getUnitSources(unitId);
        if (currentCreateSources.size() > 0) {
            // use first available cost
            return currentCreateSources.get(0).getCost();
        }

        List<Integer> unitParents = unitParentsMap.get(unitId);
        if (unitParents != null) {
            for (Integer parentId : unitParents) {
                List<UnitSourceModel> parentCreateSources = getUnitSources(parentId);
                String visitedKey = unitId + "-" + parentId;
                if (parentCreateSources.size() > 0) {
                    // use first available cost
                    return parentCreateSources.get(0).getCost();
                } else if (!visitedMap.getOrDefault(unitId + "-" + parentId, false)) {
                    visitedMap.put(visitedKey, true);
                    List<ResourceModel> subTreeCost = findParentTreeCost(parentId, unitParentsMap, visitedMap);
                    if (subTreeCost != null) {
                        return subTreeCost;
                    }
                }
            }
        }
        return null;
    }

    public List<UnitSourceModel> getUnitSources(int unitId) {
        return sourcesLookupMap.getOrDefault(unitId, new ArrayList<>());
    }
}
