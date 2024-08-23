package com.wsunitstats.exporter.model.exported;

import com.wsunitstats.exporter.model.exported.submodel.AirplaneModel;
import com.wsunitstats.exporter.model.exported.submodel.ArmorModel;
import com.wsunitstats.exporter.model.exported.submodel.BuildingModel;
import com.wsunitstats.exporter.model.exported.submodel.ConstructionModel;
import com.wsunitstats.exporter.model.exported.submodel.GatherModel;
import com.wsunitstats.exporter.model.exported.submodel.HealModel;
import com.wsunitstats.exporter.model.exported.submodel.MovementModel;
import com.wsunitstats.exporter.model.exported.submodel.NationModel;
import com.wsunitstats.exporter.model.exported.submodel.SubmarineDepthModel;
import com.wsunitstats.exporter.model.exported.submodel.SupplyModel;
import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import com.wsunitstats.exporter.model.exported.submodel.TransportingModel;
import com.wsunitstats.exporter.model.exported.submodel.TurretModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.container.GenericAbilityContainer;
import com.wsunitstats.exporter.model.exported.submodel.research.UnitResearchModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Collection;
import java.util.List;

@Getter
@Setter
@ToString
public class UnitModel extends GenericEntityModel {
    // Unit traits
    private NationModel nation;
    private String description;
    private Double size;
    private Double viewRange;
    private Double health;
    private Double regenerationSpeed;
    private Integer weaponOnDeath;
    private boolean controllable;
    private List<TagModel> tags;
    private List<TagModel> searchTags;
    private Double lifetime;
    private Boolean parentMustIdle;
    private Boolean receiveFriendlyDamage;
    private Integer threat;
    private Integer weight;
    private Integer storageMultiplier;
    private List<GenericAbilityContainer> abilities;
    private List<WeaponModel> weapons;
    private List<TurretModel> turrets;
    private List<ArmorModel> armor;

    // Technical data to render research selector
    private Collection<UnitResearchModel> applicableResearches;

    // Movable unit traits
    private MovementModel movement;
    private TransportingModel transporting;
    private SupplyModel supply;

    // Worker traits
    private List<GatherModel> gather;
    private HealModel heal;
    private List<ConstructionModel> construction;

    // Building traits
    private BuildingModel build;

    // Jet traits
    private AirplaneModel airplane;

    // Submarine traits
    private SubmarineDepthModel submarine;

    // Goats and fowls
    private Integer limit;
}
