package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ArmorModel;
import com.wsunitstats.exporter.model.exported.submodel.BuildingModel;
import com.wsunitstats.exporter.model.exported.submodel.ConstructionModel;
import com.wsunitstats.exporter.model.exported.submodel.GatherModel;
import com.wsunitstats.exporter.model.exported.submodel.TurretModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UpgradeModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
import com.wsunitstats.exporter.model.GroundAttackDataWrapper;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.model.json.gameplay.GameplayFileJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.AbilityWrapperJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ArmorJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.AttackJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.BuildJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.BuildingJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.DeathabilityJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.GatherJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.MovementJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ScenesJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.TurretJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.air.AirplaneJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.ResearchJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.UpgradeJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.WeaponJsonModel;
import com.wsunitstats.exporter.model.json.visual.VisualFileJsonModel;
import com.wsunitstats.exporter.model.json.visual.submodel.UnitTypeJsonModel;
import com.wsunitstats.exporter.service.AbilityMappingService;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.ImageService;
import com.wsunitstats.exporter.service.ModelMappingService;
import com.wsunitstats.exporter.service.ModelResolver;
import com.wsunitstats.exporter.service.NationResolver;
import com.wsunitstats.exporter.service.TagResolver;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.wsunitstats.exporter.utils.Constants.LIVESTOCK_LIMIT;
import static com.wsunitstats.exporter.utils.Constants.STORAGE_MULTIPLIER_DEFAULT;
import static com.wsunitstats.exporter.utils.Constants.STORAGE_MULTIPLIER_MODIFIER;

@Service
public class ModelResolverImpl implements ModelResolver {
    @Autowired
    private ModelMappingService mappingService;
    @Autowired
    private AbilityMappingService abilityMappingService;
    @Autowired
    private ImageService imageService;
    @Autowired
    private FileContentService fileContentService;
    @Autowired
    private NationResolver nationResolver;
    @Autowired
    private TagResolver tagResolver;

    @Override
    public List<UnitModel> resolveUnits() {
        GameplayFileJsonModel gameplayModel = fileContentService.getGameplayFileModel();
        VisualFileJsonModel visualModel = fileContentService.getVisualFileModel();
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();

        ScenesJsonModel scenes = gameplayModel.getScenes();
        Map<Integer, UnitJsonModel> unitMap = scenes.getUnits();
        Map<Integer, UnitTypeJsonModel> unitTypeMap = visualModel.getUnitTypes();

        Map<Integer, ResearchJsonModel> researches = gameplayModel.getResearches().getList();
        Map<Integer, UpgradeJsonModel> upgrades = gameplayModel.getResearches().getUpgrades();

        Map<Integer, Set<Integer>> unitResearchesMap = generateUnitResearchesMap(researches, upgrades);


        List<UnitModel> result = new ArrayList<>();
        for (Map.Entry<Integer, UnitJsonModel> entry : unitMap.entrySet()) {
            Integer id = entry.getKey();
            UnitJsonModel unitJsonModel = entry.getValue();
            UnitModel unit = new UnitModel();

            // Generic traits
            unit.setGameId(id);
            unit.setName(localizationKeyModel.getUnitNames().get(id));
            unit.setImage(imageService.getImageName(Constants.EntityType.UNIT.getName(), id));
            unit.setNation(nationResolver.getUnitNation(id));
            unit.setDescription(localizationKeyModel.getUnitTexts().get(id));

            // Build traits
            unit.setBuild(getBuildModel(unitJsonModel, gameplayModel, id));

            // Unit traits
            unit.setViewRange(Utils.intToDoubleShift(unitJsonModel.getViewRange()));
            unit.setTags(tagResolver.getUnitTags(unitJsonModel.getTags()));
            unit.setSearchTags(tagResolver.getUnitSearchTags(unitJsonModel.getSearchTags()));
            unit.setControllable(Utils.getInvertedBoolean(unitJsonModel.getControllable()));
            unit.setParentMustIdle(unitJsonModel.getParentMustIdle());
            unit.setHeal(mappingService.map(unitJsonModel.getHeal()));
            unit.setSize(Utils.intToDoubleShift(unitJsonModel.getSize()));
            Integer storageMultiplier = unitJsonModel.getStorageMultiplier();
            if (storageMultiplier == null) {
                unit.setStorageMultiplier((int) (STORAGE_MULTIPLIER_MODIFIER * STORAGE_MULTIPLIER_DEFAULT));
            } else if (storageMultiplier != 0) {
                unit.setStorageMultiplier((int) (STORAGE_MULTIPLIER_MODIFIER * storageMultiplier));
            }

            AbilityWrapperJsonModel ability = unitJsonModel.getAbility();
            if (ability != null) {
                unit.setAbilities(abilityMappingService.mapAbilities(unitJsonModel));
            }

            DeathabilityJsonModel deathability = unitJsonModel.getDeathability();
            if (deathability != null) {
                unit.setArmor(getArmorList(deathability.getArmor()));
                unit.setRegenerationSpeed(Utils.intToDoubleTick(deathability.getRegeneration()));
                unit.setThreat(deathability.getThreat());
                unit.setReceiveFriendlyDamage(Utils.getInvertedBoolean(deathability.getReceiveFriendlyDamage()));
                unit.setLifetime(Utils.intToDoubleShift(deathability.getLifeTime()));
                unit.setHealth(Utils.intToDoubleShift(deathability.getHealth()));
            }

            AttackJsonModel attack = unitJsonModel.getAttack();
            String externalData = unitTypeMap.get(id).getExternalData();
            if (attack != null) {
                Integer onDeathId = attack.getWeaponUseOnDeath();
                unit.setWeapons(getWeaponsList(attack.getWeapons(), externalData, false, onDeathId));
                unit.setTurrets(getTurretList(attack.getTurrets(), externalData));
                unit.setSupply(mappingService.map(unitJsonModel.getSupply()));
                unit.setWeaponOnDeath(onDeathId);
            }

            MovementJsonModel movement = unitJsonModel.getMovement();
            if (movement != null) {
                AirplaneJsonModel airplaneAndSubmarineModel = movement.getAirplane();
                unit.setAirplane(mappingService.mapAirplane(airplaneAndSubmarineModel));
                unit.setSubmarine(mappingService.mapSubmarine(airplaneAndSubmarineModel));
                unit.setTransporting(mappingService.map(movement.getTransporting(), unitJsonModel.getTransport()));
                unit.setGather(getGatherList(movement.getGather()));
                unit.setConstruction(getConstructionList(movement.getBuilding()));
                unit.setMovement(mappingService.map(movement));
                unit.setWeight(movement.getWeight());
            } else {
                unit.setTransporting(mappingService.map(null, unitJsonModel.getTransport()));
            }

            if (Constants.LIVESTOCK_IDS.contains(id)) {
                unit.setLimit(LIVESTOCK_LIMIT);
            }

            unit.setApplicableResearches(unitResearchesMap.get(id));

            result.add(unit);
        }
        return result;
    }

    @Override
    public List<ResearchModel> resolveResearches() {
        GameplayFileJsonModel gameplayModel = fileContentService.getGameplayFileModel();
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();

        Map<Integer, ResearchJsonModel> researches = gameplayModel.getResearches().getList();
        Map<Integer, UpgradeJsonModel> upgrades = gameplayModel.getResearches().getUpgrades();

        List<ResearchModel> result = new ArrayList<>();
        for (Map.Entry<Integer, ResearchJsonModel> entry : researches.entrySet()) {
            int id = entry.getKey();
            ResearchJsonModel researchJsonModel = entry.getValue();
            ResearchModel researchModel = new ResearchModel();
            researchModel.setGameId(id);
            researchModel.setImage(imageService.getImageName(Constants.EntityType.UPGRADE.getName(), id));
            researchModel.setName(localizationKeyModel.getResearchNames().get(id));
            researchModel.setDescription(localizationKeyModel.getResearchTexts().get(id));
            researchModel.setUpgrades(getUpgrades(researchJsonModel, upgrades));
            result.add(researchModel);
        }
        return result;
    }

    private List<UpgradeModel> getUpgrades(ResearchJsonModel research, Map<Integer, UpgradeJsonModel> upgrades) {
        return research == null ? null : research.getUpgrades().stream()
                .map(upgradeId -> mappingService.map(upgradeId, upgrades.get(upgradeId)))
                .collect(Collectors.toList());
    }

    private Map<Integer, Set<Integer>> generateUnitResearchesMap(Map<Integer, ResearchJsonModel> researches,
                                                                 Map<Integer, UpgradeJsonModel> upgrades) {
        Map<Integer, Set<Integer>> unitResearchesMap = new HashMap<>();
        researches.forEach((researchId, research) -> {
            if (research == null) {
                return;
            }
            List<Integer> researchUpgrades = research.getUpgrades();
            researchUpgrades.forEach(upgradeId -> {
                UpgradeJsonModel upgrade = upgrades.get(upgradeId);
                Integer unitId = upgrade.getUnit();
                if (unitId == null) {
                    return;
                }
                Set<Integer> unitResearches = unitResearchesMap.getOrDefault(unitId, new HashSet<>());
                unitResearches.add(researchId);
                unitResearchesMap.put(unitId, unitResearches);
            });
        });
        return unitResearchesMap;
    }

    private BuildingModel getBuildModel(UnitJsonModel unitJsonModel, GameplayFileJsonModel gameplayJsonModel, int unitId) {
        List<BuildJsonModel> buildJsonModels = gameplayJsonModel.getBuild();
        return IntStream.range(0, buildJsonModels.size())
                .filter(index -> buildJsonModels.get(index).getUnit() == unitId)
                .mapToObj(index -> mappingService.map(index, unitJsonModel, buildJsonModels.get(index)))
                .findFirst()
                .orElse(null);
    }

    private List<GatherModel> getGatherList(List<GatherJsonModel> gatherList) {
        return gatherList == null ? new ArrayList<>() :
                IntStream.range(0, gatherList.size())
                        .mapToObj(index -> mappingService.map(index, gatherList.get(index)))
                        .toList();
    }

    private List<ArmorModel> getArmorList(ArmorJsonModel armorJsonModel) {
        //Armor should not be null for every unit
        List<ArmorJsonModel.Entry> entries = armorJsonModel.getData();
        if (entries == null) {
            return null;
        }
        int probabilitiesSum = Utils.sum(armorJsonModel.getData().stream().map(ArmorJsonModel.Entry::getProbability).toList());
        return entries.stream()
                .map(entry -> mappingService.map(entry, probabilitiesSum))
                .toList();
    }

    private List<WeaponModel> getWeaponsList(List<WeaponJsonModel> weaponList,
                                             String attackGroundString,
                                             boolean isTurret,
                                             Integer onDeathId) {
        List<WeaponModel> result = new ArrayList<>();
        if (weaponList != null) {
            GroundAttackDataWrapper attackGroundData = mappingService.map(attackGroundString);
            result = IntStream.range(0, weaponList.size())
                    .mapToObj(index -> mappingService.map(index, weaponList.get(index), getAttackGround(attackGroundData, isTurret, index), isTurret, onDeathId))
                    .toList();
        }
        return result;
    }

    private List<TurretModel> getTurretList(List<TurretJsonModel> turretList,
                                            String attackGroundString) {
        return turretList == null ? new ArrayList<>() :
                IntStream.range(0, turretList.size())
                        .mapToObj(index -> {
                            TurretJsonModel turret = turretList.get(index);
                            return mappingService.map(index, turret, getWeaponsList(turret.getWeapons(), attackGroundString, true, null));
                        })
                        .toList();
    }

    private List<ConstructionModel> getConstructionList(List<BuildingJsonModel> buildingList) {
        return buildingList == null ? new ArrayList<>() :
                IntStream.range(0, buildingList.size())
                        .mapToObj(index -> mappingService.map(index, buildingList.get(index)))
                        .toList();
    }

    private boolean getAttackGround(GroundAttackDataWrapper attackGroundData, boolean isTurret, int weaponId) {
        boolean attackGround = false;
        if (attackGroundData.isAttackGround() && attackGroundData.getWeaponId() == weaponId) {
            // if 'current-weapon-type' corresponds 'attack-ground-weapon-type'
            if ((!isTurret && attackGroundData.getWeaponTypeDescriptor() == 0) ||
                (isTurret && attackGroundData.getWeaponTypeDescriptor() == 1)) {
                attackGround = true;
            }
        }
        return attackGround;
    }
}
