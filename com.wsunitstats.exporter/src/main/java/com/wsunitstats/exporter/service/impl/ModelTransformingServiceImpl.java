package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.model.exported.submodel.AirplaneModel;
import com.wsunitstats.exporter.model.exported.submodel.ArmorModel;
import com.wsunitstats.exporter.model.exported.submodel.BuildingModel;
import com.wsunitstats.exporter.model.exported.submodel.ConstructionModel;
import com.wsunitstats.exporter.model.exported.submodel.DistanceModel;
import com.wsunitstats.exporter.model.exported.submodel.EnvTagModel;
import com.wsunitstats.exporter.model.exported.submodel.GatherModel;
import com.wsunitstats.exporter.model.exported.submodel.HealModel;
import com.wsunitstats.exporter.model.exported.submodel.IncomeModel;
import com.wsunitstats.exporter.model.exported.submodel.MovementModel;
import com.wsunitstats.exporter.model.exported.submodel.ReserveModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import com.wsunitstats.exporter.model.exported.submodel.SubmarineDepthModel;
import com.wsunitstats.exporter.model.exported.submodel.SupplyModel;
import com.wsunitstats.exporter.model.exported.submodel.TransportingModel;
import com.wsunitstats.exporter.model.exported.submodel.TurretModel;
import com.wsunitstats.exporter.model.exported.submodel.requirement.RequirementsModel;
import com.wsunitstats.exporter.model.exported.submodel.requirement.ResearchRequirementModel;
import com.wsunitstats.exporter.model.exported.submodel.requirement.UnitRequirementModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UpgradeModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.BuffModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageWrapperModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.ExternalDataModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.ProjectileModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ArmorJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.BuildJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.BuildingJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.DeathabilityJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.EnvJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.GatherJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.HealJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.IncomeJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.MovementJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ProjectileJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.SupplyJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.TransportJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.TransportingJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.TurretJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UpgradesScriptsJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.air.AerodromeJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.air.AirplaneJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.requirement.RequirementsJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.requirement.UnitRequirementJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.UpgradeJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.BuffJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DamageJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DirectionAttacksPointJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DistanceJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.WeaponJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.work.WorkReserveJsonModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.ImageService;
import com.wsunitstats.exporter.service.ModelTransformingService;
import com.wsunitstats.exporter.service.NationResolver;
import com.wsunitstats.exporter.service.TagResolver;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Utils;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.Range;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.apache.commons.collections4.ListUtils.emptyIfNull;

@Slf4j
@Service
public class ModelTransformingServiceImpl implements ModelTransformingService {
    private static final Pattern ATTACK_GROUND_PATTERN = Pattern.compile("\"groundAttack\":\\{}");
    private static final int PROBABILITY_MAX = 100;

    @Autowired
    private ImageService imageService;
    @Autowired
    private FileContentService fileContentService;
    @Autowired
    private NationResolver nationResolver;
    @Autowired
    private TagResolver tagResolver;

    private LocalizationKeyModel localization;
    private Map<Integer, EnvJsonModel> envMap;
    private Map<Integer, ProjectileJsonModel> projectileMap;
    private UpgradesScriptsJsonModel upgradesScripts;

    @PostConstruct
    protected void postConstruct() {
        localization = fileContentService.getLocalizationKeyModel();
        envMap = fileContentService.getGameplayFileModel().getScenes().getEnvs();
        projectileMap = fileContentService.getGameplayFileModel().getScenes().getProjectiles();
        upgradesScripts = fileContentService.getGameplayFileModel().getUpgradesScripts();
    }

    @Override
    public ArmorModel transformArmor(ArmorJsonModel.Entry armorEntryJsonModel, int probabilitiesSum) {
        if (armorEntryJsonModel == null) {
            return null;
        }
        ArmorModel armorModel = new ArmorModel();
        armorModel.setValue(Utils.intToDoubleShift(armorEntryJsonModel.getObject()));
        Optional.ofNullable(armorEntryJsonModel.getProbability()).ifPresentOrElse(
                (p) -> armorModel.setProbability(Range.between(0, 100).fit(p)),
                () -> {
                    if (probabilitiesSum == 0) {
                        armorModel.setProbability(PROBABILITY_MAX);
                    } else {
                        armorModel.setProbability(PROBABILITY_MAX - probabilitiesSum);
                    }
                }
        );
        return armorModel;
    }

    @Override
    public GatherModel transformGather(int index, GatherJsonModel gatherJsonModel) {
        if (gatherJsonModel == null) {
            return null;
        }
        GatherModel gatherModel = new GatherModel();
        gatherModel.setGatherId(index);
        gatherModel.setAngle(Utils.intToDoubleShift(gatherJsonModel.getAngle()));
        gatherModel.setBagSize(Utils.intToDoubleShift(gatherJsonModel.getBagsize()));
        Double gatherDistance = Utils.intToDoubleShift(gatherJsonModel.getGatherdistance());
        gatherModel.setGatherDistance(gatherDistance != null ? gatherDistance : 0);
        gatherModel.setPerSecond(Utils.intToDoubleTick(gatherJsonModel.getPertick()));
        Integer findTargetDistance = gatherJsonModel.getFindtargetdistance();
        gatherModel.setFindTargetDistance(findTargetDistance != null ? Utils.intToDoubleShift(findTargetDistance) : Constants.DEFAULT_GATHER_FIND_TARGET_DISTANCE);
        // present only in game, probably hardcoded in the engine
        gatherModel.setFindStorageDistance(Constants.DEFAULT_GATHER_FIND_STORAGE_DISTANCE);
        gatherModel.setPutDistance(Utils.intToDoubleShift(gatherJsonModel.getPutdistance()));
        gatherModel.setEnvTags(transformEnvTags(gatherJsonModel.getEnvtags()));
        gatherModel.setStorageTags(tagResolver.getUnitSearchTags(gatherJsonModel.getStoragetags()));
        gatherModel.setUnitTags(tagResolver.getUnitSearchTags(gatherJsonModel.getUnitTags()));
        gatherModel.setResource(transformResource(gatherJsonModel.getResource(), null));
        return gatherModel;
    }

    @Override
    public List<ResourceModel> transformResources(List<Integer> resourceModelJson) {
        List<ResourceModel> resources = new ArrayList<>();
        if (resourceModelJson != null && !resourceModelJson.isEmpty()) {
            for (int i = 0; i < Constants.ACTIVE_RESOURCES; ++i) {
                resources.add(transformResource(i, Utils.intToDoubleShift(resourceModelJson.get(i)).intValue()));
            }
        }
        return resources;
    }

    @Override
    public ResourceModel transformResource(Integer resourceId, Integer resourceValue) {
        ResourceModel resource = new ResourceModel();
        resource.setResourceId(resourceId);
        resource.setResourceName(localization.getResourceNames().get(resourceId));
        resource.setValue(resourceValue);
        resource.setImage(imageService.getImageName(Constants.EntityType.RESOURCE.getName(), resourceId));
        return resource;
    }

    @Override
    public TransportingModel transformTransport(TransportingJsonModel transportingJsonModel, TransportJsonModel transportJsonModel) {
        if (transportingJsonModel == null && transportJsonModel == null) {
            return null;
        }
        TransportingModel transportingModel = new TransportingModel();
        if (transportJsonModel != null) {
            transportingModel.setCarrySize(transportJsonModel.getVolume());
            transportingModel.setOnlyInfantry(transportJsonModel.getUnitLimit() != null ? true : null);
        }
        if (transportingJsonModel != null) {
            transportingModel.setOwnSize(transportingJsonModel.getOwnVolume());
        }
        return transportingModel;
    }

    @Override
    public MovementModel transformMovement(MovementJsonModel movementJsonModel) {
        if (movementJsonModel == null) {
            return null;
        }
        MovementModel movementModel = new MovementModel();
        movementModel.setSpeed(movementJsonModel.getSpeed());
        movementModel.setRotationSpeed(Utils.intToDoubleShift(movementJsonModel.getRotationSpeed()));
        return movementModel;
    }

    @Override
    public ReserveModel transformReserve(WorkReserveJsonModel workReserveJsonModel) {
        if (workReserveJsonModel == null) {
            return null;
        }
        ReserveModel reserveModel = new ReserveModel();
        reserveModel.setReserveLimit(workReserveJsonModel.getLimit());
        reserveModel.setReserveTime(Utils.intToDoubleShift(workReserveJsonModel.getTime()));
        return reserveModel;
    }

    @Override
    public RequirementsModel transformRequirements(RequirementsJsonModel requirementsJsonModel) {
        if (requirementsJsonModel == null) {
            return null;
        }
        RequirementsModel requirementsModel = new RequirementsModel();
        List<Integer> researches = requirementsJsonModel.getResearches();
        List<ResearchRequirementModel> researchRequirementModels = emptyIfNull(researches)
                .stream()
                .map(researchId -> {
                    ResearchRequirementModel result = new ResearchRequirementModel();
                    result.setResearchId(researchId);
                    result.setResearchImage(imageService.getImageName(Constants.EntityType.UPGRADE.getName(), researchId));
                    result.setResearchName(localization.getResearchNames().get(researchId));
                    return result;
                })
                .toList();
        List<UnitRequirementJsonModel> units = requirementsJsonModel.getUnits();
        List<UnitRequirementModel> unitRequirementModels = emptyIfNull(units)
                .stream()
                .map(unitJson -> {
                    UnitRequirementModel result = new UnitRequirementModel();
                    int unitId = unitJson.getType();
                    setQuantity(result, unitJson.getMin(), unitJson.getMax());
                    result.setUnitImage(imageService.getImageName(Constants.EntityType.UNIT.getName(), unitId));
                    result.setUnitId(unitId);
                    result.setUnitName(localization.getUnitNames().get(unitId));
                    result.setUnitNation(nationResolver.getUnitNation(unitId));
                    return result;
                })
                .toList();
        requirementsModel.setResearches(researchRequirementModels);
        requirementsModel.setUnits(unitRequirementModels);
        requirementsModel.setResearchesAll(Utils.getDirectBoolean(requirementsJsonModel.getResearchesAll()));
        requirementsModel.setUnitsAll(Utils.getInvertedBoolean(requirementsJsonModel.getUnitsAll()));
        return requirementsModel;
    }

    @Override
    public WeaponModel transformWeapon(int weaponId,
                                       WeaponJsonModel weaponJsonModel,
                                       Boolean attackGround,
                                       boolean isTurret,
                                       Integer onDeathId) {
        if (weaponJsonModel == null) {
            return null;
        }
        WeaponModel weaponModel = new WeaponModel();
        weaponModel.setWeaponId(weaponId);
        weaponModel.setAttackGround(attackGround);
        weaponModel.setAutoAttack(Utils.getInvertedBoolean(weaponJsonModel.getAutoAttack()));
        weaponModel.setDistance(transformDistance(weaponJsonModel.getDistance()));
        weaponModel.setEnabled(weaponJsonModel.getEnabled());
        Integer projectileId = weaponJsonModel.getProjectile();
        weaponModel.setProjectile(projectileId == null ? null : transformProjectile(projectileId, projectileMap.get(projectileId)));
        weaponModel.setRechargePeriod(Utils.intToDoubleShift(weaponJsonModel.getRechargePeriod()));
        weaponModel.setSpread(Utils.intToPercent(weaponJsonModel.getSpread()));
        List<DirectionAttacksPointJsonModel> points = weaponJsonModel.getDirectionAttacks().getDefaultValue().getPoints();
        Integer startTime = points.get(0).getTime();
        Integer endTime = points.get(points.size() - 1).getTime();
        // size should be always > 1
        int attacksPerAction = weaponJsonModel.getDirectionAttacks().getDefaultValue().getPoints().size();
        weaponModel.setAttackDelay(Utils.intToDoubleShift(startTime));
        weaponModel.setAttackTime(Utils.intToDoubleShift(endTime));
        weaponModel.setAvgShotTime(Utils.doubleToDoubleShift(getAvgShotTime(points)));
        weaponModel.setAttacksPerAction(attacksPerAction);
        weaponModel.setAttacksPerAttack(getMultipliable(weaponJsonModel.getAttackscount()));
        weaponModel.setCharges(weaponJsonModel.getCharges());
        weaponModel.setAngle(Utils.intToDoubleShift(weaponJsonModel.getAngle()));
        weaponModel.setDamage(transformDamage(weaponJsonModel.getDamage()));
        weaponModel.setWeaponType(getWeaponType(isTurret, weaponModel, onDeathId));
        return weaponModel;
    }

    @Override
    public DamageWrapperModel transformDamage(DamageJsonModel damageJsonModel) {
        DamageWrapperModel damageWrapperModel = new DamageWrapperModel();
        damageWrapperModel.setAreaType(Constants.DamageAreaType.get(damageJsonModel.getArea()).getName());
        damageWrapperModel.setAngle(Utils.intToDoubleShift(damageJsonModel.getAngle()));
        damageWrapperModel.setBuff(transformBuff(damageJsonModel.getBuff()));
        damageWrapperModel.setDamageFriendly(Utils.getDirectBoolean(damageJsonModel.getDamageFriendly()));
        damageWrapperModel.setDamages(transformDamages(damageJsonModel.getDamages()));
        damageWrapperModel.setDamagesCount(getMultipliable(damageJsonModel.getDamagesCount()));
        damageWrapperModel.setEnvDamage(Utils.intToDoubleShift(damageJsonModel.getEnvDamage()));
        damageWrapperModel.setEnvsAffected(tagResolver.getEnvSearchTags(damageJsonModel.getEnvsAffected()));
        damageWrapperModel.setRadius(Utils.intToDoubleShift(damageJsonModel.getRadius()));
        return damageWrapperModel;
    }

    @Override
    public List<DamageModel> transformDamages(List<List<Integer>> damagesJson) {
        List<DamageModel> damages = new ArrayList<>();
        for (List<Integer> damageList : damagesJson) {
            int unitTag = damageList.get(0);
            int value = damageList.get(1);

            DamageModel damage = new DamageModel();
            damage.setType(unitTag == 0 ? Constants.BASIC_DAMAGE_TYPE : localization.getUnitTagNames().get(unitTag - 1));
            damage.setValue(Utils.intToDoubleShift(value));
            damages.add(damage);
        }
        return damages;
    }

    @Override
    public DistanceModel transformDistance(DistanceJsonModel distanceJsonModel) {
        if (distanceJsonModel == null) {
            return null;
        }
        DistanceModel distanceModel = new DistanceModel();
        distanceModel.setMax(Utils.intToDoubleShift(distanceJsonModel.getMax()));
        distanceModel.setMin(Utils.intToDoubleShift(distanceJsonModel.getMin()));
        distanceModel.setStop(Utils.intToDoubleShift(distanceJsonModel.getStop()));
        return distanceModel;
    }

    @Override
    public ProjectileModel transformProjectile(int id, ProjectileJsonModel projectileJsonModel) {
        if (projectileJsonModel == null) {
            return null;
        }
        ProjectileModel projectileModel = new ProjectileModel();
        projectileModel.setGameId(id);
        projectileModel.setSpeed(Utils.intToDoubleSpeed(projectileJsonModel.getSpeed()));
        projectileModel.setTimeToStartCollision(Utils.intToDoubleShift(projectileJsonModel.getCollisionTimeToStart()));
        return projectileModel;
    }

    @Override
    public BuffModel transformBuff(BuffJsonModel buffJsonModel) {
        if (buffJsonModel == null) {
            return null;
        }
        BuffModel buffModel = new BuffModel();
        buffModel.setBuffId(buffJsonModel.getResearch());
        buffModel.setPeriod(Utils.intToDoubleShift(buffJsonModel.getPeriod()));
        buffModel.setAffectedUnits(tagResolver.getUnitTags(buffJsonModel.getTargetsTags()));
        EntityInfoModel entityInfo = new EntityInfoModel();
        int entityId = buffJsonModel.getResearch();
        entityInfo.setEntityName(localization.getResearchNames().get(entityId));
        entityInfo.setEntityImage(imageService.getImageName(Constants.EntityType.UPGRADE.getName(), entityId));
        entityInfo.setEntityId(entityId);
        buffModel.setEntityInfo(entityInfo);
        return buffModel;
    }

    @Override
    public TurretModel transformTurret(int turretId, TurretJsonModel turretJsonModel, List<WeaponModel> turretWeapons) {
        if (turretJsonModel == null) {
            return null;
        }
        TurretModel turretModel = new TurretModel();
        turretModel.setTurretId(turretId);
        turretModel.setRotationSpeed(Utils.intToDoubleShift(turretJsonModel.getRotationSpeed()));
        turretModel.setWeapons(turretWeapons);
        return turretModel;
    }

    @Override
    public SupplyModel transformSupply(SupplyJsonModel supplyJsonModel) {
        if (supplyJsonModel == null) {
            return null;
        }
        Integer cost = null;
        Integer take = null;
        List<Integer> costList = supplyJsonModel.getCostList();
        List<Integer> takeList = supplyJsonModel.getTakesList();
        if (costList != null && costList.size() > 0) {
            cost = supplyJsonModel.getCostList().get(0);
        }
        if (takeList != null && takeList.size() > 0) {
            take = supplyJsonModel.getTakesList().get(0);
        }
        SupplyModel supplyModel = new SupplyModel();
        supplyModel.setConsume(Utils.intToSupply(cost));
        supplyModel.setProduce(Utils.intToSupply(take));
        return supplyModel;
    }

    @Override
    public BuildingModel transformBuilding(int buildId, UnitJsonModel unitJsonModel, BuildJsonModel buildJsonModel) {
        DeathabilityJsonModel deathability = unitJsonModel.getDeathability();
        IncomeJsonModel income = unitJsonModel.getIncome();
        if (buildJsonModel == null && (deathability == null || deathability.getHealMeCost() == null) && income == null) {
            return null;
        }
        BuildingModel buildingModel = new BuildingModel();
        buildingModel.setBuildId(buildId);
        if (deathability != null) {
            buildingModel.setHealCost(transformResources(deathability.getHealMeCost()));
            if (buildJsonModel != null) {
                buildingModel.setInitHealth(getInitHealth(deathability.getHealth(), buildJsonModel.getHealth()));
            }
        }
        if (buildJsonModel != null) {
            buildingModel.setRequirements(transformRequirements(buildJsonModel.getRequirements()));
            buildingModel.setInitCost(transformResources(buildJsonModel.getCostInit()));
            List<Integer> fullCost = Utils.add(buildJsonModel.getCostInit(), buildJsonModel.getCostBuilding());
            buildingModel.setFullCost(transformResources(fullCost));
        }
        if (income != null) {
            buildingModel.setIncome(transformIncome(income));
        }
        return buildingModel;
    }

    @Override
    public IncomeModel transformIncome(IncomeJsonModel incomeJsonModel) {
        if (incomeJsonModel == null) {
            return null;
        }
        IncomeModel incomeModel = new IncomeModel();
        incomeModel.setValue(transformResources(incomeJsonModel.getValue()));
        incomeModel.setPeriod(Utils.intToDoubleShift(incomeJsonModel.getPeriod()));
        return incomeModel;
    }

    @Override
    public AirplaneModel transformAirplane(AirplaneJsonModel airplaneJsonModel) {
        // check if airplane model does not belong to submarine
        if (airplaneJsonModel == null || airplaneJsonModel.getHeightAboveSurface() <= 1) {
            return null;
        }
        AirplaneModel airplaneModel = new AirplaneModel();
        airplaneModel.setFuel(Utils.intToDoubleShift(airplaneJsonModel.getFuel()));
        airplaneModel.setKamikaze(airplaneJsonModel.getMoveAsFallDown());
        airplaneModel.setFlyHeight(Utils.intToDoubleShift(airplaneJsonModel.getHeightAboveSurface()));
        airplaneModel.setAscensionSpeed(airplaneJsonModel.getAscensionalRate());
        AerodromeJsonModel aerodromeSource = airplaneJsonModel.getAerodrome();
        if (aerodromeSource != null) {
            airplaneModel.setAerodromeTags(tagResolver.getUnitSearchTags(aerodromeSource.getTags()));
            airplaneModel.setHealingSpeed(Utils.intToDoubleTick(aerodromeSource.getHealingSpeed()));
            airplaneModel.setRechargePeriod(Utils.intToDoubleShift(aerodromeSource.getRechargingPeriod()));
            airplaneModel.setRefuelSpeed(Utils.intToDoubleTick(aerodromeSource.getRefuelingSpeed()));
        }
        return airplaneModel;
    }

    @Override
    public SubmarineDepthModel transformSubmarine(AirplaneJsonModel airplaneJsonModel) {
        // check if airplane model belongs to submarine
        if (airplaneJsonModel == null || airplaneJsonModel.getHeightAboveSurface() > 1) {
            return null;
        }
        SubmarineDepthModel submarineModel = new SubmarineDepthModel();
        submarineModel.setUnderwaterTime(Utils.intToDoubleShift(airplaneJsonModel.getFuel()));
        submarineModel.setAbilityOnFuelEnd(airplaneJsonModel.getWorkOnFuelEnd());
        submarineModel.setSwimDepth(Utils.intToDoubleShift(airplaneJsonModel.getHeightAboveSurface()));
        submarineModel.setAscensionSpeed(airplaneJsonModel.getAscensionalRate());
        return submarineModel;
    }

    @Override
    public List<EnvTagModel> transformEnvTags(Long tags) {
        List<EnvTagModel> envTags = new ArrayList<>();
        if (tags != null) {
            List<Integer> tagIds = Utils.getPositiveBitIndices(tags);
            for (int tagId : tagIds) {
                EnvTagModel envTag = new EnvTagModel();
                envTag.setEnvId(tagId);
                envTag.setEnvName(localization.getEnvSearchTagNames().get(tagId));
                Map.Entry<Integer, EnvJsonModel> targetEnvEntry = envMap.entrySet().stream()
                        .filter(envEntry -> envEntry.getValue().getSearchTags() != null)
                        .filter(envEntry -> {
                            List<Integer> searchTags = Utils.getPositiveBitIndices(envEntry.getValue().getSearchTags());
                            if (searchTags.size() != 1) {
                                throw new IllegalStateException("Should be only 1 search tag for single env");
                            }
                            return tagId == searchTags.get(0);
                        })
                        .findAny()
                        .orElseThrow();
                envTag.setEnvImage(imageService.getImageName(Constants.EntityType.ENV.getName(), targetEnvEntry.getKey()));
                envTags.add(envTag);
            }
        }
        return envTags;
    }

    @Override
    public HealModel transformHeal(HealJsonModel healJsonModel) {
        if (healJsonModel == null) {
            return null;
        }
        HealModel healModel = new HealModel();
        healModel.setDistance(Utils.intToDoubleShift(healJsonModel.getDistance()));
        healModel.setTargetTags(tagResolver.getUnitTags(healJsonModel.getTargetTags()));
        healModel.setPerSecond(Utils.intToDoubleTick(healJsonModel.getPerTick()));
        healModel.setSearchNextDistance(Utils.intToDoubleShift(healJsonModel.getSearchNextDistance()));
        healModel.setAutoSearchTargetDistance(Utils.intToDoubleShift(healJsonModel.getAutoSearchTargetDistance()));
        healModel.setAutoSearchTargetPeriod(Utils.intToDoubleShift(healJsonModel.getAutoSearchTargetPeriod()));
        return healModel;
    }

    @Override
    public ConstructionModel transformConstruction(int id, BuildingJsonModel buildingJsonModel) {
        if (buildingJsonModel == null) {
            return null;
        }
        ConstructionModel constructionModel = new ConstructionModel();
        EntityInfoModel entityInfoModel = new EntityInfoModel();
        Integer entityId = buildingJsonModel.getId();
        entityInfoModel.setEntityId(entityId);
        entityInfoModel.setEntityNation(nationResolver.getUnitNation(entityId));
        entityInfoModel.setEntityName(localization.getUnitNames().get(entityId));
        entityInfoModel.setEntityImage(imageService.getImageName(Constants.EntityType.UNIT.getName(), entityId));
        constructionModel.setEntityInfo(entityInfoModel);
        constructionModel.setConstructionId(id);
        constructionModel.setDistance(Utils.intToDoubleShift(buildingJsonModel.getDistance()));
        constructionModel.setConstructionSpeed(Utils.intToConstructionSpeed(buildingJsonModel.getProgress()));
        constructionModel.setConstructionSpeedOnOwnTerritory(Utils.intToConstructionSpeed(buildingJsonModel.getProgressTerritory()));
        return constructionModel;
    }

    @Override
    public ExternalDataModel transformExternalData(String externalDataString) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(externalDataString, ExternalDataModel.class);
        } catch (Exception e) {
            log.error("Can't parse attackGroundString");
        }
        return new ExternalDataModel();
    }

    @Override
    public UpgradeModel transformUpgrade(int id, UpgradeJsonModel upgradeJsonModel) {
        if (upgradeJsonModel == null) {
            return null;
        }
        UpgradeModel upgradeModel = new UpgradeModel();
        upgradeModel.setUpgradeId(id);
        upgradeModel.setParameters(transformParameters(upgradeJsonModel.getParameters()));
        int programId = upgradeJsonModel.getProgram();
        upgradeModel.setProgramId(programId);
        upgradeModel.setProgramFile(upgradesScripts.getPath() + "/" + upgradesScripts.getList().get(programId).getFile());

        EntityInfoModel unitInfo = new EntityInfoModel();
        Integer unitId = upgradeJsonModel.getUnit();
        if (unitId != null) {
            unitInfo.setEntityId(unitId);
            unitInfo.setEntityName(localization.getUnitNames().get(unitId));
            unitInfo.setEntityImage(imageService.getImageName(Constants.EntityType.UNIT.getName(), unitId));
            unitInfo.setEntityNation(nationResolver.getUnitNation(unitId));
            upgradeModel.setUnit(unitInfo);
        }

        return upgradeModel;
    }

    @Override
    public Map<String, String> transformParameters(String parameters) {
        return StringUtils.isNotBlank(parameters)
                ? Arrays.stream(parameters.split(","))
                .map(p -> p.split("="))
                .collect(Collectors.toMap(p -> p[0], p -> p[1]))
                : new HashMap<>();
    }

    private int getMultipliable(Integer i) {
        return i == null ? 1 : i;
    }

    private Double getAvgShotTime(List<DirectionAttacksPointJsonModel> points) {
        double result = IntStream.range(0, points.size())
                .map(i -> {
                    int diff = 0;
                    if (i < points.size() - 1) {
                        diff = points.get(i + 1).getTime() - points.get(i).getTime();
                    }
                    return diff;
                })
                .average()
                .orElse(0);
        if (result > 0) {
            return result;
        } else {
            return null;
        }
    }

    /**
     * initial_hp = hp/100*health_param*1.5
     */
    private Double getInitHealth(Integer fullHealth, Integer healthParam) {
        if (fullHealth == null || healthParam == null) {
            return null;
        }
        double healthPerPercent = Utils.intToDoubleShift(fullHealth) / 100d;
        return healthPerPercent * Utils.intToDoubleShift(healthParam) * Constants.INIT_HEALTH_MODIFIER;
    }

    private String getWeaponType(boolean isTurret, WeaponModel weaponModel, Integer onDeathId) {
        if (isTurret) {
            return Constants.WeaponType.TURRET.getName();
        } else if (weaponModel.getCharges() != null) {
            return Constants.WeaponType.AERIAL_BOMB.getName();
        } else if (onDeathId != null && weaponModel.getWeaponId() == onDeathId) {
            return Constants.WeaponType.SUICIDE.getName();
        } else {
            return weaponModel.getSpread() != null ? Constants.WeaponType.RANGE.getName() : Constants.WeaponType.MELEE.getName();
        }
    }

    private void setQuantity(UnitRequirementModel model, Integer min, Integer max) {
        String str = Constants.QuantityType.FROM_TO.getName();
        Integer actualMin = min;
        Integer actualMax = max;
        if (min == null && max == null) {
            str = Constants.QuantityType.NOT_LESS_THAN.getName();
            actualMin = 1;
            actualMax = -1;
        }
        if (min != null && max == null) {
            str = Constants.QuantityType.NOT_LESS_THAN.getName();
            // assigned actualMin = min;
            actualMax = -1;
        }
        // min == null && max != null
        if (min == null && max != null) {
            str = Constants.QuantityType.NOT_MORE_THAN.getName();
            actualMin = -1;
            // assigned actualMax = max;
        }
        // min != null && max != null
        model.setQuantityStr(str);
        model.setQuantityMin(actualMin);
        model.setQuantityMax(actualMax);
    }
}
