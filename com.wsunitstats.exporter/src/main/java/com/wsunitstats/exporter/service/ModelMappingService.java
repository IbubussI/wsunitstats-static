package com.wsunitstats.exporter.service;

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
import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import com.wsunitstats.exporter.model.exported.submodel.TransportingModel;
import com.wsunitstats.exporter.model.exported.submodel.TurretModel;
import com.wsunitstats.exporter.model.exported.submodel.requirement.RequirementsModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UpgradeModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.BuffModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageWrapperModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.ProjectileModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
import com.wsunitstats.exporter.model.GroundAttackDataWrapper;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ArmorJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.BuildJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.BuildingJsonModel;
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
import com.wsunitstats.exporter.model.json.gameplay.submodel.air.AirplaneJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.requirement.RequirementsJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.UpgradeJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.BuffJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DamageJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DistanceJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.WeaponJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.work.WorkReserveJsonModel;
import com.wsunitstats.exporter.utils.Constants;

import java.util.List;
import java.util.function.IntFunction;

public interface ModelMappingService {
    ArmorModel map(ArmorJsonModel.Entry source, int probabilitiesSum);

    GatherModel map(int index, GatherJsonModel source);

    List<ResourceModel> mapResources(List<Integer> source);

    ResourceModel mapResource(Integer resourceId, Integer resourceValue);

    TransportingModel map(TransportingJsonModel transportingSource, TransportJsonModel transportSource);

    MovementModel map(MovementJsonModel source);

    ReserveModel map(WorkReserveJsonModel reserveSource);

    RequirementsModel map(RequirementsJsonModel source);

    WeaponModel map(int weaponId,
                    WeaponJsonModel weaponSource,
                    Boolean attackGround,
                    boolean isTurret,
                    Integer onDeathId);

    DamageWrapperModel map(DamageJsonModel damageJsonModel);

    List<DamageModel> mapDamages(List<List<Integer>> damagesSource);

    DistanceModel map(DistanceJsonModel distanceSource);

    ProjectileModel map(int id, ProjectileJsonModel projectileSource);

    BuffModel map(BuffJsonModel buffSource);

    TurretModel map(int turretId, TurretJsonModel turretSource, List<WeaponModel> turretWeapons);

    SupplyModel map(SupplyJsonModel supplySource);

    BuildingModel map(int buildId, UnitJsonModel unitSource, BuildJsonModel buildSource);

    IncomeModel map(IncomeJsonModel incomeSource);

    AirplaneModel mapAirplane(AirplaneJsonModel airplaneSource);

    SubmarineDepthModel mapSubmarine(AirplaneJsonModel submarineSource);

    /**
     * Works fine for all tags except unit tags. Use {@link ModelMappingService#mapUnitTags} for them
     */
    List<TagModel> mapTags(Constants.TagGroupName groupName, Long tags, IntFunction<String> nameGetter);

    /**
     * Use this for unit tags
     */
    List<TagModel> mapUnitTags(Long tags);

    List<EnvTagModel> mapEnvTags(Long tags);

    HealModel map(HealJsonModel healSource);

    ConstructionModel map(int id, BuildingJsonModel buildingSource);

    GroundAttackDataWrapper map(String attackGroundString);

    UpgradeModel map(int id, UpgradeJsonModel upgradeSource);

    List<String> mapParameters(String parametersSource);
}
