package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityProvider;
import com.wsunitstats.exporter.entity.EntityReferences;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ArmorModel;
import com.wsunitstats.exporter.model.exported.submodel.BuildingModel;
import com.wsunitstats.exporter.model.exported.submodel.ConstructionModel;
import com.wsunitstats.exporter.model.exported.submodel.GatherModel;
import com.wsunitstats.exporter.model.exported.submodel.TurretModel;
import com.wsunitstats.exporter.model.exported.submodel.TypedArmorModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UnitResearchModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UnitResearchUpgrade;
import com.wsunitstats.exporter.model.exported.submodel.research.UpgradeModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.ExternalDataModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
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
import com.wsunitstats.exporter.model.json.gameplay.submodel.TurretJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.air.AirplaneJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.ResearchJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.UpgradeJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.WeaponJsonModel;
import com.wsunitstats.exporter.model.json.visual.submodel.UnitTypeJsonModel;
import com.wsunitstats.exporter.service.AbilityTransformingService;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.ImageService;
import com.wsunitstats.exporter.service.ModelBuilder;
import com.wsunitstats.exporter.service.ModelTransformingService;
import com.wsunitstats.exporter.service.NationResolver;
import com.wsunitstats.exporter.service.TagResolver;
import com.wsunitstats.exporter.service.UnitCategoryService;
import com.wsunitstats.exporter.service.UnitSourceFinder;
import com.wsunitstats.exporter.service.UnitValueCalculator;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Constants.ResearchType;
import com.wsunitstats.exporter.utils.Utils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.wsunitstats.exporter.model.exported.submodel.weapon.ExternalDataModel.*;
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
    @Autowired
    private UnitCategoryService unitCategoryService;
    @Autowired
    private UnitValueCalculator unitValueCalculator;

    // research groups, as references to researches
    @Value("${researches.ageTransitionResearches}")
    private List<String> ageTransitionResearches;
    @Value("${researches.ecoResearches}")
    private List<String> ecoResearches;
    @Value("${researches.popResearches}")
    private List<String> popResearches;
    @Value("${researches.territoryResearches}")
    private List<String> territoryResearches;
    @Value("${researches.combatResearches}")
    private List<String> combatResearches;
    @Value("${researches.unitResearches}")
    private List<String> unitResearches;
    @Value("${researches.buffResearches}")
    private List<String> buffResearches;
    @Value("${researches.wonderTransitionResearches}")
    private List<String> wonderTransitionResearches;

    private final Map<ResearchType, Set<EntityId>> researchTypes = new LinkedHashMap<>();
    private Set<EntityId> livestockUnits;

    @PostConstruct
    protected void postConstruct() {
        EntityProvider<ResearchJsonModel> researches = fileContentService.getResearches();
        researchTypes.put(ResearchType.AGE_TRANSITION, EntityReferences.resolveAll(researches, ageTransitionResearches));
        researchTypes.put(ResearchType.ECO, EntityReferences.resolveAll(researches, ecoResearches));
        researchTypes.put(ResearchType.POP, EntityReferences.resolveAll(researches, popResearches));
        researchTypes.put(ResearchType.TERRITORY, EntityReferences.resolveAll(researches, territoryResearches));
        researchTypes.put(ResearchType.COMBAT, EntityReferences.resolveAll(researches, combatResearches));
        researchTypes.put(ResearchType.UNIT, EntityReferences.resolveAll(researches, unitResearches));
        researchTypes.put(ResearchType.BUFF, EntityReferences.resolveAll(researches, buffResearches));
        researchTypes.put(ResearchType.WONDER_TRANSITION, EntityReferences.resolveAll(researches, wonderTransitionResearches));
        livestockUnits = EntityReferences.resolveAll(fileContentService.getUnits(), Constants.LIVESTOCK_UNITS);
    }

    @Override
    public List<UnitModel> buildUnits() {
        GameplayFileJsonModel gameplayModel = fileContentService.getGameplayFileModel();
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();
        EntityProvider<UnitTypeJsonModel> unitTypes = fileContentService.getUnitTypes();

        Map<EntityId, List<UnitResearchModel>> unitResearchesMap = generateUnitResearchesMap();

        List<UnitModel> units = new ArrayList<>();
        fileContentService.getUnits().forEach((id, unitJsonModel) -> {
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
            unit.setLifetime(Utils.intToDoubleShift(unitJsonModel.getLifeTime()));
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
                unit.setArmorZonal(getArmorList(deathability.getArmor()));
                unit.setArmorTyped(getTypedArmor(deathability.getArmor()));
                unit.setRegenerationSpeed(Utils.intToDoubleTick(deathability.getRegeneration()));
                unit.setThreat(deathability.getThreat());
                unit.setReceiveFriendlyDamage(Utils.getInvertedBoolean(deathability.getReceiveFriendlyDamage()));
                unit.setHealth(Utils.intToDoubleShift(deathability.getHealth()));
            }

            AttackJsonModel attack = unitJsonModel.getAttack();
            String externalDataString = unitTypes.get(id).getExternalData();
            ExternalDataModel externalData = transformingService.transformExternalData(externalDataString);
            if (attack != null) {
                Integer onDeathId = attack.getWeaponUseOnDeath();
                unit.setWeapons(getWeaponsList(attack.getWeapons(), externalData.getGroundAttack(), false, -1, onDeathId));
                unit.setTurrets(getTurretList(attack.getTurrets(), externalData.getGroundAttack()));
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

            if (livestockUnits.contains(id)) {
                unit.setLimit(LIVESTOCK_LIMIT);
            }

            unit.setApplicableResearches(unitResearchesMap.get(id));
            unit.setCategory(unitCategoryService.getSimpleUnitCategory(unit).getName());
            unit.setAdvancedCategory(unitCategoryService.getAdvancedUnitCategory(unit).getName());

            units.add(unit);
        });

        // second iteration to find unit sources
        UnitSourceFinder unitSourceFinder = new UnitSourceFinder(units);
        for (UnitModel unit : units) {
            unit.setSources(unitSourceFinder.getUnitSources(unit.getGameId()));
            unit.setKillValue(unitValueCalculator.calcKillValue(unit));
        }
        return units;
    }

    @Override
    public List<ResearchModel> buildResearches() {
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();

        List<ResearchModel> result = new ArrayList<>();
        // insertion order here is crucial, since in Replay Info UI we have a retrieval of research by index in this array
        fileContentService.getResearches().forEach((id, researchJsonModel) -> {
            ResearchModel researchModel = new ResearchModel();
            researchModel.setGameId(id);
            researchModel.setImage(imageService.getImageName(Constants.EntityType.UPGRADE.getName(), id));
            researchModel.setName(localizationKeyModel.getResearchNames().get(id));
            researchModel.setDescription(localizationKeyModel.getResearchTexts().get(id));
            researchModel.setUpgrades(getUpgrades(researchJsonModel));
            researchModel.setType(getResearchType(id));
            result.add(researchModel);
        });
        return result;
    }

    private String getResearchType(EntityId id) {
        return researchTypes.entrySet().stream()
                .filter(entry -> entry.getValue().contains(id))
                .map(entry -> entry.getKey().getType())
                .findFirst()
                .orElse(ResearchType.OTHER.getType());
    }

    private List<UpgradeModel> getUpgrades(ResearchJsonModel research) {
        EntityProvider<UpgradeJsonModel> upgrades = fileContentService.getUpgrades();
        return research.getUpgrades() == null ? null : research.getUpgrades().stream()
                .map(upgradeId -> transformingService.transformUpgrade(upgradeId, upgrades.get(upgradeId)))
                .collect(Collectors.toList());
    }

    private Map<EntityId, List<UnitResearchModel>> generateUnitResearchesMap() {
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();
        EntityProvider<UpgradeJsonModel> upgrades = fileContentService.getUpgrades();
        Map<EntityId, List<UnitResearchModel>> unitResearchesMap = new LinkedHashMap<>();
        fileContentService.getResearches().forEach((researchId, research) -> {
            List<EntityId> researchUpgrades = research.getUpgrades();
            if (researchUpgrades == null) {
                return;
            }

            for (EntityId researchUpgrade : researchUpgrades) {
                UpgradeJsonModel upgrade = upgrades.get(researchUpgrade);
                EntityId unitId = upgrade.getUnit();
                if (unitId == null) {
                    continue;
                }

                List<UnitResearchModel> unitResearches = unitResearchesMap.getOrDefault(unitId, new ArrayList<>());
                UnitResearchModel unitResearch = unitResearches.stream()
                        .filter(unitResearchExistent -> researchId.equals(unitResearchExistent.getGameId()))
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
        });
        return unitResearchesMap;
    }

    private BuildingModel getBuildModel(UnitJsonModel unitJsonModel, GameplayFileJsonModel gameplayJsonModel, EntityId unitId) {
        List<BuildJsonModel> buildJsonModels = gameplayJsonModel.getBuild();
        int buildId = IntStream.range(0, buildJsonModels.size())
                .filter(index -> buildJsonModels.get(index) != null)
                .filter(index -> unitId.equals(buildJsonModels.get(index).getUnit()))
                .findFirst()
                .orElse(-1);
        return transformingService.transformBuilding(buildId, unitJsonModel, buildId >= 0 ? buildJsonModels.get(buildId) : null);
    }

    private List<GatherModel> getGatherList(List<GatherJsonModel> gatherList) {
        return gatherList == null ? new ArrayList<>() :
                IntStream.range(0, gatherList.size())
                        .mapToObj(index -> transformingService.transformGather(index, gatherList.get(index)))
                        .toList();
    }

    /**
     * @return armor multiplier (in percent) by damage type, ordered by damage type,
     * or null if the armor does not depend on damage type
     */
    private List<TypedArmorModel> getTypedArmor(ArmorJsonModel armorJsonModel) {
        Map<Integer, Integer> typed = armorJsonModel != null ? armorJsonModel.getTyped() : null;
        if (typed == null) {
            return null;
        }
        return new TreeMap<>(typed).entrySet().stream()
                .map(entry -> {
                    TypedArmorModel typedArmor = new TypedArmorModel();
                    typedArmor.setType(Constants.DAMAGE_TYPE_NAMES.getOrDefault(entry.getKey(), String.valueOf(entry.getKey())));
                    typedArmor.setProbability((int) Math.round(entry.getValue() / Constants.TYPED_ARMOR_MAX * 100));
                    return typedArmor;
                })
                .toList();
    }

    private List<ArmorModel> getArmorList(ArmorJsonModel armorJsonModel) {
        List<ArmorJsonModel.Entry> entries = armorJsonModel != null ? armorJsonModel.getZonal() : null;
        if (entries == null) {
            return null;
        }
        int probabilitiesSum = Utils.sum(entries.stream().map(ArmorJsonModel.Entry::getProbability).toList());
        return entries.stream()
                .map(entry -> transformingService.transformArmor(entry, probabilitiesSum))
                .toList();
    }

    private List<WeaponModel> getWeaponsList(List<WeaponJsonModel> weaponList,
                                             GroundAttack attackGround,
                                             boolean isTurret,
                                             int turretId,
                                             Integer onDeathId) {
        List<WeaponModel> result = new ArrayList<>();
        if (weaponList != null) {
            result = IntStream.range(0, weaponList.size())
                    .mapToObj(weaponId -> transformingService.transformWeapon(weaponId, weaponList.get(weaponId),
                            getAttackGround(attackGround, isTurret, turretId, weaponId), isTurret, onDeathId))
                    .toList();
        }
        return result;
    }

    private List<TurretModel> getTurretList(List<TurretJsonModel> turretList,
                                            GroundAttack attackGround) {
        return turretList == null ? new ArrayList<>() :
                IntStream.range(0, turretList.size())
                        .mapToObj(turretId -> {
                            TurretJsonModel turret = turretList.get(turretId);
                            return transformingService.transformTurret(turretId, turret, getWeaponsList(turret.getWeapons(),
                                    attackGround, true, turretId, null));
                        })
                        .toList();
    }

    private List<ConstructionModel> getConstructionList(List<BuildingJsonModel> buildingList) {
        return buildingList == null ? new ArrayList<>() :
                IntStream.range(0, buildingList.size())
                        .mapToObj(index -> transformingService.transformConstruction(index, buildingList.get(index)))
                        .toList();
    }

    private boolean getAttackGround(GroundAttack groundAttack, boolean isTurret, int turretId, int weaponId) {
        boolean attackGround = false;
        if (groundAttack != null) {
            if (isTurret) {
                List<List<Integer>> turrets = groundAttack.getTurrets();
                if (turrets != null) {
                    Map<Integer, Integer> turretMap = turrets.stream().collect(Collectors.toMap(e -> e.get(0), e -> e.get(1)));
                    attackGround = Objects.equals(turretMap.get(turretId), weaponId);
                }
            } else {
                Integer weapon = groundAttack.getWeapon();
                if (weapon != null) {
                    attackGround = weaponId == weapon;
                }
            }
        }
        return attackGround;
    }
}
