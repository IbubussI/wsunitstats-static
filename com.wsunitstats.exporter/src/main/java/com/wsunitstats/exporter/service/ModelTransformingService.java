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

import java.util.List;
import java.util.Map;

public interface ModelTransformingService {
    ArmorModel transformArmor(ArmorJsonModel.Entry source, int probabilitiesSum);

    GatherModel transformGather(int index, GatherJsonModel source);

    List<ResourceModel> transformResources(List<Integer> source);

    ResourceModel transformResource(Integer resourceId, Integer resourceValue);

    TransportingModel transformTransport(TransportingJsonModel transportingSource, TransportJsonModel transportSource);

    MovementModel transformMovement(MovementJsonModel source);

    ReserveModel transformReserve(WorkReserveJsonModel reserveSource);

    RequirementsModel transformRequirements(RequirementsJsonModel source);

    WeaponModel transformWeapon(int weaponId,
                                WeaponJsonModel weaponSource,
                                Boolean attackGround,
                                boolean isTurret,
                                Integer onDeathId);

    DamageWrapperModel transformDamage(DamageJsonModel damageJsonModel);

    List<DamageModel> transformDamages(List<List<Integer>> damagesSource);

    DistanceModel transformDistance(DistanceJsonModel distanceSource);

    ProjectileModel transformProjectile(int id, ProjectileJsonModel projectileSource);

    BuffModel transformBuff(BuffJsonModel buffSource);

    TurretModel transformTurret(int turretId, TurretJsonModel turretSource, List<WeaponModel> turretWeapons);

    SupplyModel transformSupply(SupplyJsonModel supplySource);

    BuildingModel transformBuilding(int buildId, UnitJsonModel unitSource, BuildJsonModel buildSource);

    IncomeModel transformIncome(IncomeJsonModel incomeSource);

    AirplaneModel transformAirplane(AirplaneJsonModel airplaneSource);

    SubmarineDepthModel transformSubmarine(AirplaneJsonModel submarineSource);

    List<EnvTagModel> transformEnvTags(Long tags);

    HealModel transformHeal(HealJsonModel healSource);

    ConstructionModel transformConstruction(int id, BuildingJsonModel buildingSource);

    GroundAttackDataWrapper transformGroundAttack(String attackGroundString);

    UpgradeModel transformUpgrade(int id, UpgradeJsonModel upgradeSource);

    Map<String, String> transformParameters(String parametersSource);
}
