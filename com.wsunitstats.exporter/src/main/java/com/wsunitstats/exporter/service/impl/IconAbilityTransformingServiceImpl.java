package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.IconAbilityModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.AttackJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.TurretJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ZoneEventJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ability.AbilityDataJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ability.AbilityJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ability.AbilityOnActionJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.BuffJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.WeaponJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.work.WorkJsonModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.IconAbilityTransformingService;
import com.wsunitstats.exporter.service.ModelTransformingService;
import com.wsunitstats.exporter.service.TagResolver;
import com.wsunitstats.exporter.utils.Constants.AbilityTrigger;
import com.wsunitstats.exporter.utils.Constants.AbilityType;
import com.wsunitstats.exporter.utils.Constants.IconAbility;
import com.wsunitstats.exporter.utils.Utils;
import jakarta.annotation.PostConstruct;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;

/**
 * Makes the abilities shown as icons out of the game abilities. The game abilities are generic (damage, buff,
 * units in radius), so the kind of the icon is decided by what they do and what triggers them.
 */
@Service
public class IconAbilityTransformingServiceImpl implements IconAbilityTransformingService {
    private static final Logger LOG = LogManager.getLogger(IconAbilityTransformingServiceImpl.class);

    @Autowired
    private FileContentService fileContentService;
    @Autowired
    private ModelTransformingService modelTransformingService;
    @Autowired
    private TagResolver tagResolver;

    private LocalizationKeyModel localization;

    @PostConstruct
    protected void postConstruct() {
        localization = fileContentService.getLocalizationKeyModel();
    }

    @Override
    public List<IconAbilityModel> transformIconAbilities(EntityId unitId, UnitJsonModel unitJsonModel, Collection<Integer> otherAbilityIds) {
        List<IconAbilityModel> result = new ArrayList<>();
        AbilityOnActionJsonModel onAction = unitJsonModel.getAbility().getAbilityOnAction();
        if (onAction != null) {
            result.addAll(transformOnAction(unitJsonModel, onAction));
        }
        ZoneEventJsonModel zoneEvent = unitJsonModel.getAbility().getZoneEvent();
        if (zoneEvent != null) {
            result.addAll(transformZoneEvent(unitJsonModel, zoneEvent));
        }
        otherAbilityIds.stream()
                .map(abilityId -> transformOther(unitId, unitJsonModel, abilityId))
                .filter(Objects::nonNull)
                .forEach(result::add);
        return result;
    }

    /**
     * Abilities used on actions of the unit: damage to units under it (tanks) together with units moving out of its way,
     * buffs to itself (charge) or to units around (panic)
     */
    private List<IconAbilityModel> transformOnAction(UnitJsonModel unitJsonModel, AbilityOnActionJsonModel onAction) {
        List<IconAbilityModel> result = new ArrayList<>();
        List<Integer> damageIds = new ArrayList<>();
        List<Integer> scatterIds = new ArrayList<>();
        for (Integer abilityId : onAction.getAbilities()) {
            AbilityJsonModel ability = getAbility(unitJsonModel, abilityId);
            AbilityType type = getType(ability);
            if (type == AbilityType.DAMAGE && !getUnitDamages(ability.getData()).isEmpty()) {
                damageIds.add(abilityId);
            } else if (type == AbilityType.UNITS_IN_RADIUS && ability.getData().getBuff() == null) {
                scatterIds.add(abilityId);
            } else if (type == AbilityType.UNITS_IN_RADIUS) {
                result.add(withOnAction(transformUnitsInRadius(ability, abilityId, IconAbility.AREA_BUFF), onAction));
            } else if (type == AbilityType.SELF_BUFF) {
                IconAbilityModel model = newModel(IconAbility.SELF_BUFF, AbilityTrigger.ACTION, abilityId);
                setResearch(model, ability.getData().getResearch(), ability.getData().getDuration());
                result.add(withOnAction(model, onAction));
            } else {
                LOG.warn("On action ability {} of type {} is not shown", abilityId, type);
            }
        }

        if (!damageIds.isEmpty()) {
            IconAbilityModel model = newModel(IconAbility.CRUSH_UNITS, AbilityTrigger.ACTION, null);
            model.setAbilityIds(Stream.concat(damageIds.stream(), scatterIds.stream()).toList());
            AbilityDataJsonModel damage = getAbility(unitJsonModel, damageIds.get(0)).getData();
            model.setDamages(getUnitDamages(damage));
            model.setDamageExcludedUnits(getDamageExcludedUnits(damage));
            model.setDamageRadius(Utils.intToDoubleShift(damage.getRadius()));
            // units in the way move aside
            if (!scatterIds.isEmpty()) {
                AbilityDataJsonModel scatter = getAbility(unitJsonModel, scatterIds.get(0)).getData();
                model.setRadius(Utils.intToDoubleShift(scatter.getRadius()));
                model.setMoveDistance(Utils.intToDoubleShift(scatter.getMoveDistance()));
                model.setAffectedUnits(tagResolver.getUnitTags(scatter.getTags()));
                model.setExcludedUnits(tagResolver.getUnitTags(scatter.getTagsExclude()));
            }
            result.add(0, withOnAction(model, onAction));
        } else {
            scatterIds.forEach(abilityId -> result.add(withOnAction(
                    transformUnitsInRadius(getAbility(unitJsonModel, abilityId), abilityId, IconAbility.SCATTER), onAction)));
        }
        return result;
    }

    /**
     * Abilities used when the unit moves through envs: damage to the envs (tanks break trees) with a buff to itself
     * (slowed down in the forest). Or the work done when units come close or leave (gates open and close).
     */
    private List<IconAbilityModel> transformZoneEvent(UnitJsonModel unitJsonModel, ZoneEventJsonModel zoneEvent) {
        List<IconAbilityModel> result = new ArrayList<>();
        if (zoneEvent.getWork() != null) {
            IconAbilityModel autoTransform = transformZoneWork(unitJsonModel, zoneEvent);
            if (autoTransform != null) {
                result.add(autoTransform);
            }
        }
        if (zoneEvent.getAbilities() == null) {
            return result;
        }
        IconAbilityModel crush = null;
        List<IconAbilityModel> buffs = new ArrayList<>();
        for (Integer abilityId : zoneEvent.getAbilities()) {
            AbilityJsonModel ability = getAbility(unitJsonModel, abilityId);
            AbilityType type = getType(ability);
            AbilityDataJsonModel data = ability.getData();
            if (type == AbilityType.DAMAGE && data.getEnvDamage() != null && data.getEnvDamage() > 0 && crush == null) {
                crush = newModel(IconAbility.CRUSH_ENVS, AbilityTrigger.ZONE, abilityId);
                crush.setEnvDamage(Utils.intToDoubleShift(data.getEnvDamage()));
                crush.setAffectedEnvs(tagResolver.getEnvSearchTags(
                        data.getEnvsAffected() != null ? data.getEnvsAffected() : zoneEvent.getEnvTags()));
            } else if (type == AbilityType.SELF_BUFF) {
                IconAbilityModel buff = newModel(IconAbility.SELF_BUFF, AbilityTrigger.ZONE, abilityId);
                setResearch(buff, data.getResearch(), data.getDuration());
                buffs.add(buff);
            } else {
                LOG.warn("Zone event ability {} of type {} is not shown", abilityId, type);
            }
        }

        if (crush != null && !buffs.isEmpty()) {
            // the buff of the unit moving through the envs (e.g. slowed down)
            IconAbilityModel buff = buffs.remove(0);
            crush.setAbilityIds(Stream.concat(crush.getAbilityIds().stream(), buff.getAbilityIds().stream()).toList());
            crush.setResearch(buff.getResearch());
            crush.setResearchDescription(buff.getResearchDescription());
            crush.setDuration(buff.getDuration());
        }
        if (crush != null) {
            result.add(crush);
        }
        result.addAll(buffs);
        return result;
    }

    /**
     * Work done when own or allied units come within the distance, or leave it (gates open and close by themselves)
     */
    private IconAbilityModel transformZoneWork(UnitJsonModel unitJsonModel, ZoneEventJsonModel zoneEvent) {
        List<WorkJsonModel> work = unitJsonModel.getAbility().getWork();
        int workId = zoneEvent.getWork();
        WorkJsonModel workJsonModel = work != null && workId >= 0 && workId < work.size() ? work.get(workId) : null;
        AbilityJsonModel ability = workJsonModel == null ? null : getAbility(unitJsonModel, workJsonModel.getAbility());
        if (ability == null || getType(ability) != AbilityType.TRANSFORM) {
            LOG.warn("Zone event work {} is not shown", workId);
            return null;
        }
        IconAbilityModel model = newModel(IconAbility.AUTO_TRANSFORM, AbilityTrigger.ZONE, workJsonModel.getAbility());
        model.setTransformUnit(modelTransformingService.transformUnitInfo(ability.getData().getUnit()));
        model.setRadius(Utils.intToDoubleShift(zoneEvent.getUnitSearchDistance()));
        model.setUnitsAbsent(Utils.getDirectBoolean(zoneEvent.getUnitsAbsent()));
        model.setAffectsOwn(Utils.getDirectBoolean(zoneEvent.getUnitOwn()));
        model.setAffectsAllies(Utils.getDirectBoolean(zoneEvent.getUnitAlly()));
        return model;
    }

    /**
     * Abilities without a container: triggered by weapons (saboteur planting a bomb) or by game scripts (dance)
     */
    private IconAbilityModel transformOther(EntityId unitId, UnitJsonModel unitJsonModel, int abilityId) {
        AbilityJsonModel ability = getAbility(unitJsonModel, abilityId);
        if (ability == null) {
            return null;
        }
        AbilityType type = getType(ability);
        if (type == AbilityType.SELF_STUN) {
            // the dance command is given only to the units listed in the game scripts, the others can't use it
            Set<EntityId> danceUnits = fileContentService.getDanceUnits();
            if (danceUnits != null && !danceUnits.contains(unitId)) {
                return null;
            }
            IconAbilityModel model = newModel(IconAbility.DANCE, AbilityTrigger.SCRIPT, abilityId);
            model.setDuration(Utils.intToDoubleShift(ability.getData().getDuration()));
            return model;
        }
        if (type == AbilityType.UNITS_IN_RADIUS) {
            IconAbility icon = ability.getData().getBuff() != null ? IconAbility.AREA_BUFF : IconAbility.SCATTER;
            IconAbilityModel model = transformUnitsInRadius(ability, abilityId, icon);
            List<WeaponJsonModel> weapons = getWeaponsUsing(unitJsonModel, abilityId);
            model.setTrigger((weapons.isEmpty() ? AbilityTrigger.SCRIPT : AbilityTrigger.WEAPON).getName());
            // unit created by the same weapon (e.g. a bomb)
            weapons.stream()
                    .flatMap(weapon -> weapon.getAbilities().stream())
                    .map(id -> getAbility(unitJsonModel, id))
                    .filter(other -> other != null && getType(other) == AbilityType.CREATE_UNIT)
                    .findFirst()
                    .ifPresent(createUnit -> model.setCreatedUnit(modelTransformingService.transformUnitInfo(createUnit.getData().getUnit())));
            return model;
        }
        if (type != AbilityType.UNDEFINED) {
            LOG.warn("Ability {} of type {} is not shown", abilityId, type);
        }
        return null;
    }

    private IconAbilityModel transformUnitsInRadius(AbilityJsonModel ability, int abilityId, IconAbility icon) {
        AbilityDataJsonModel data = ability.getData();
        IconAbilityModel model = newModel(icon, AbilityTrigger.ACTION, abilityId);
        model.setRadius(Utils.intToDoubleShift(data.getRadius()));
        model.setMoveDistance(Utils.intToDoubleShift(data.getMoveDistance()));
        model.setAffectedUnits(tagResolver.getUnitTags(data.getTags()));
        model.setExcludedUnits(tagResolver.getUnitTags(data.getTagsExclude()));
        // affects all units, unless set otherwise
        model.setAffectsAllies(Utils.getInvertedBoolean(data.getAlly()));
        model.setAffectsEnemies(Utils.getInvertedBoolean(data.getEnemy()));
        BuffJsonModel buff = data.getBuff();
        if (buff != null) {
            setResearch(model, buff.getResearch(), buff.getDuration());
        }
        return model;
    }

    private IconAbilityModel newModel(IconAbility icon, AbilityTrigger trigger, Integer abilityId) {
        IconAbilityModel model = new IconAbilityModel();
        model.setIcon(icon.getName());
        model.setTrigger(trigger.getName());
        model.setAbilityIds(abilityId == null ? List.of() : List.of(abilityId));
        return model;
    }

    private IconAbilityModel withOnAction(IconAbilityModel model, AbilityOnActionJsonModel onAction) {
        model.setTrigger(AbilityTrigger.ACTION.getName());
        model.setEnabled(onAction.getEnabled() == null || onAction.getEnabled());
        model.setRechargeTime(Utils.intToDoubleShift(onAction.getRestore()));
        model.setDistance(modelTransformingService.transformDistance(onAction.getDistance()));
        return model;
    }

    private void setResearch(IconAbilityModel model, EntityId researchId, Integer duration) {
        if (researchId != null) {
            model.setResearch(modelTransformingService.transformResearchInfo(researchId));
            model.setResearchDescription(localization.getResearchTexts().get(researchId));
        }
        model.setDuration(Utils.intToDoubleShift(duration));
    }

    /** Damages of the ability to units (only the positive ones, zero values exclude the targets) */
    private List<DamageModel> getUnitDamages(AbilityDataJsonModel data) {
        if (data == null || data.getDamages() == null) {
            return List.of();
        }
        return modelTransformingService.transformDamages(data.getDamages()).stream()
                .filter(damage -> damage.getValue() != null && damage.getValue() > 0)
                .toList();
    }

    /**
     * Tags the ability does no damage to: zero damage for a tag overrides the damage for the other tags
     * (e.g. tanks damage alive units, but not large ones). Tag 0 is the basic damage, not a tag of units.
     */
    private List<TagModel> getDamageExcludedUnits(AbilityDataJsonModel data) {
        if (data == null || data.getDamages() == null) {
            return List.of();
        }
        long tags = data.getDamages().stream()
                .filter(damage -> damage.get(0) != 0 && damage.get(1) == 0)
                .mapToLong(damage -> 1L << damage.get(0))
                .reduce(0L, (first, second) -> first | second);
        return tagResolver.getUnitTags(tags);
    }

    private List<WeaponJsonModel> getWeaponsUsing(UnitJsonModel unitJsonModel, int abilityId) {
        AttackJsonModel attack = unitJsonModel.getAttack();
        if (attack == null) {
            return List.of();
        }
        Stream<WeaponJsonModel> turretWeapons = attack.getTurrets() == null ? Stream.empty() : attack.getTurrets().stream()
                .filter(Objects::nonNull)
                .map(TurretJsonModel::getWeapons)
                .filter(Objects::nonNull)
                .flatMap(List::stream);
        Stream<WeaponJsonModel> weapons = attack.getWeapons() == null ? Stream.empty() : attack.getWeapons().stream();
        return Stream.concat(weapons, turretWeapons)
                .filter(weapon -> weapon != null && weapon.getAbilities() != null && weapon.getAbilities().contains(abilityId))
                .toList();
    }

    private AbilityJsonModel getAbility(UnitJsonModel unitJsonModel, int abilityId) {
        List<AbilityJsonModel> abilities = unitJsonModel.getAbility().getAbilities();
        return abilityId >= 0 && abilityId < abilities.size() ? abilities.get(abilityId) : null;
    }

    private AbilityType getType(AbilityJsonModel ability) {
        return AbilityType.get(ability.getType() != null ? ability.getType() : 0);
    }
}
