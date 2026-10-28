package com.wsunitstats.exporter.model.exported.submodel.ability;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.model.exported.submodel.DistanceModel;
import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Ability shown as an icon. It may join several game abilities working together (e.g. a tank damages units
 * under it and makes units in its way move aside), only the fields of its kind are set.
 */
@Getter
@Setter
@ToString
public class IconAbilityModel {
    /** see Constants.IconAbility */
    private String icon;
    /** see Constants.AbilityTrigger */
    private String trigger;
    /** indexes of the game abilities */
    private List<Integer> abilityIds;
    /** false if the ability is enabled by a research */
    private Boolean enabled;
    /** recharge of the on action abilities */
    private Double rechargeTime;
    /** distance to the target the on action abilities are used at */
    private DistanceModel distance;

    /** buff (research) the ability gives and its duration */
    private EntityInfoModel research;
    /** localization key of the research description */
    private String researchDescription;
    private Double duration;

    /** damage to units (crush units) */
    private List<DamageModel> damages;
    /** units with these tags get no damage */
    private List<TagModel> damageExcludedUnits;
    private Double damageRadius;
    /** damage to envs (crush envs) */
    private Double envDamage;
    private List<TagModel> affectedEnvs;

    /** units in the radius move away and get the buff */
    private Double radius;
    private Double moveDistance;
    /** empty - all units */
    private List<TagModel> affectedUnits;
    /** units with these tags are not affected */
    private List<TagModel> excludedUnits;
    private Boolean affectsAllies;
    private Boolean affectsEnemies;

    /** unit created together with the ability (e.g. the bomb of the saboteur) */
    private EntityInfoModel createdUnit;

    /** auto transform: the unit transforms into it when own (allied) units come within the radius */
    private EntityInfoModel transformUnit;
    /** auto transform: when there are no such units within the radius instead */
    private Boolean unitsAbsent;
    private Boolean affectsOwn;
}
