package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ArmorModel;
import com.wsunitstats.exporter.model.exported.submodel.BuildingModel;
import com.wsunitstats.exporter.model.exported.submodel.ConstructionModel;
import com.wsunitstats.exporter.model.exported.submodel.GatherModel;
import com.wsunitstats.exporter.model.exported.submodel.TurretModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UnitResearchModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UnitResearchUpgrade;
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
import com.wsunitstats.exporter.service.AbilityTransformingService;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.ImageService;
import com.wsunitstats.exporter.service.ModelBuilder;
import com.wsunitstats.exporter.service.ModelTransformingService;
import com.wsunitstats.exporter.service.NationResolver;
import com.wsunitstats.exporter.service.TagResolver;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.wsunitstats.exporter.utils.Constants.LIVESTOCK_LIMIT;
import static com.wsunitstats.exporter.utils.Constants.STORAGE_MULTIPLIER_DEFAULT;
import static com.wsunitstats.exporter.utils.Constants.STORAGE_MULTIPLIER_MODIFIER;

@Service
public class ModelBuilderImpl implements ModelBuilder {
    @Autowired
    private ModelTransformingService transformingService;
    @Autowired
    private AbilityTransformingService abilityTransformingService;
    @Autowired
    private ImageService imageService;
    @Autowired
    private FileContentService fileContentService;
    @Autowired
    private NationResolver nationResolver;
    @Autowired
    private TagResolver tagResolver;

    @Override
    public List<UnitModel> buildUnits() {
        GameplayFileJsonModel gameplayModel = fileContentService.getGameplayFileModel();
        VisualFileJsonModel visualModel = fileContentService.getVisualFileModel();
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();

        ScenesJsonModel scenes = gameplayModel.getScenes();
        Map<Integer, UnitJsonModel> unitMap = scenes.getUnits();
        Map<Integer, UnitTypeJsonModel> unitTypeMap = visualModel.getUnitTypes();

        List<ResearchJsonModel> researches = gameplayModel.getResearches().getList();
        List<UpgradeJsonModel> upgrades = gameplayModel.getResearches().getUpgrades();

        Map<Integer, List<UnitResearchModel>> unitResearchesMap = generateUnitResearchesMap(researches, upgrades);

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
            unit.setHeal(transformingService.transformHeal(unitJsonModel.getHeal()));
            unit.setSize(Utils.intToDoubleShift(unitJsonModel.getSize()));
            unit.setSupply(transformingService.transformSupply(unitJsonModel.getSupply()));
            Integer storageMultiplier = unitJsonModel.getStorageMultiplier();
            if (storageMultiplier == null) {
                unit.setStorageMultiplier((int) (STORAGE_MULTIPLIER_MODIFIER * STORAGE_MULTIPLIER_DEFAULT));
            } else if (storageMultiplier != 0) {
                unit.setStorageMultiplier((int) (STORAGE_MULTIPLIER_MODIFIER * storageMultiplier));
            }

            AbilityWrapperJsonModel ability = unitJsonModel.getAbility();
            if (ability != null) {
                unit.setAbilities(abilityTransformingService.transformAbilities(unitJsonModel));
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
                unit.setWeaponOnDeath(onDeathId);
            }

            MovementJsonModel movement = unitJsonModel.getMovement();
            if (movement != null) {
                AirplaneJsonModel airplaneAndSubmarineModel = movement.getAirplane();
                unit.setAirplane(transformingService.transformAirplane(airplaneAndSubmarineModel));
                unit.setSubmarine(transformingService.transformSubmarine(airplaneAndSubmarineModel));
                unit.setTransporting(transformingService.transformTransport(movement.getTransporting(), unitJsonModel.getTransport()));
                unit.setGather(getGatherList(movement.getGather()));
                unit.setConstruction(getConstructionList(movement.getBuilding()));
                unit.setMovement(transformingService.transformMovement(movement));
                unit.setWeight(movement.getWeight());
            } else {
                unit.setTransporting(transformingService.transformTransport(null, unitJsonModel.getTransport()));
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
    public List<ResearchModel> buildResearches() {
        GameplayFileJsonModel gameplayModel = fileContentService.getGameplayFileModel();
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();

        List<ResearchJsonModel> researches = gameplayModel.getResearches().getList();
        List<UpgradeJsonModel> upgrades = gameplayModel.getResearches().getUpgrades();

        List<ResearchModel> result = new ArrayList<>();
        for (int id = 0; id < researches.size(); id++) {
            ResearchJsonModel researchJsonModel = researches.get(id);
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

    private List<UpgradeModel> getUpgrades(ResearchJsonModel research, List<UpgradeJsonModel> upgrades) {
        return research.getUpgrades() == null ? null : research.getUpgrades().stream()
                .map(upgradeId -> transformingService.transformUpgrade(upgradeId, upgrades.get(upgradeId)))
                .collect(Collectors.toList());
    }

    private Map<Integer, List<UnitResearchModel>> generateUnitResearchesMap(List<ResearchJsonModel> researches,
                                                                           List<UpgradeJsonModel> upgrades) {
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();
        Map<Integer, List<UnitResearchModel>> unitResearchesMap = new LinkedHashMap<>();
        for (int researchId = 0; researchId < researches.size(); researchId++) {
            ResearchJsonModel research = researches.get(researchId);
            List<Integer> researchUpgrades = research.getUpgrades();
            if (researchUpgrades == null) {
                continue;
            }

            for (int researchUpgrade : researchUpgrades) {
                UpgradeJsonModel upgrade = upgrades.get(researchUpgrade);
                Integer unitId = upgrade.getUnit();
                if (unitId == null) {
                    continue;
                }

                List<UnitResearchModel> unitResearches = unitResearchesMap.getOrDefault(unitId, new ArrayList<>());
                int finalResearchId = researchId;
                UnitResearchModel unitResearch = unitResearches.stream()
                        .filter(unitResearchExistent -> unitResearchExistent.getGameId() == finalResearchId)
                        .findFirst()
                        .orElse(null);
                if (unitResearch == null) {
                    unitResearch = new UnitResearchModel();
                    unitResearch.setGameId(researchId);
                    unitResearch.setImage(imageService.getImageName(Constants.EntityType.UPGRADE.getName(), researchId));
                    unitResearch.setName(localizationKeyModel.getResearchNames().get(researchId));
                    unitResearches.add(unitResearch);
                }
                UnitResearchUpgrade unitResearchUpgrade = new UnitResearchUpgrade();
                unitResearchUpgrade.setProgramId(upgrade.getProgram());
                unitResearchUpgrade.setParameters(transformingService.transformParameters(upgrade.getParameters()));
                unitResearch.addUpgrade(unitResearchUpgrade);
                unitResearchesMap.put(unitId, unitResearches);
            }
        }
        return unitResearchesMap;
    }

    private BuildingModel getBuildModel(UnitJsonModel unitJsonModel, GameplayFileJsonModel gameplayJsonModel, int unitId) {
        List<BuildJsonModel> buildJsonModels = gameplayJsonModel.getBuild();
        return IntStream.range(0, buildJsonModels.size())
                .filter(index -> buildJsonModels.get(index).getUnit() == unitId)
                .mapToObj(index -> transformingService.transformBuilding(index, unitJsonModel, buildJsonModels.get(index)))
                .findFirst()
                .orElse(null);
    }

    private List<GatherModel> getGatherList(List<GatherJsonModel> gatherList) {
        return gatherList == null ? new ArrayList<>() :
                IntStream.range(0, gatherList.size())
                        .mapToObj(index -> transformingService.transformGather(index, gatherList.get(index)))
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
                .map(entry -> transformingService.transformArmor(entry, probabilitiesSum))
                .toList();
    }

    private List<WeaponModel> getWeaponsList(List<WeaponJsonModel> weaponList,
                                             String attackGroundString,
                                             boolean isTurret,
                                             Integer onDeathId) {
        List<WeaponModel> result = new ArrayList<>();
        if (weaponList != null) {
            GroundAttackDataWrapper attackGroundData = transformingService.transformGroundAttack(attackGroundString);
            result = IntStream.range(0, weaponList.size())
                    .mapToObj(index -> transformingService.transformWeapon(index, weaponList.get(index), getAttackGround(attackGroundData, isTurret, index), isTurret, onDeathId))
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
                            return transformingService.transformTurret(index, turret, getWeaponsList(turret.getWeapons(), attackGroundString, true, null));
                        })
                        .toList();
    }

    private List<ConstructionModel> getConstructionList(List<BuildingJsonModel> buildingList) {
        return buildingList == null ? new ArrayList<>() :
                IntStream.range(0, buildingList.size())
                        .mapToObj(index -> transformingService.transformConstruction(index, buildingList.get(index)))
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
