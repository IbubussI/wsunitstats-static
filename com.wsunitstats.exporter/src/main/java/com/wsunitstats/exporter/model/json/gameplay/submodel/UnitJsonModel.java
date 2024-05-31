package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wsunitstats.exporter.model.json.gameplay.submodel.air.AirfieldJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class UnitJsonModel {
    private AbilityWrapperJsonModel ability;
    private Integer adjustToGround;
    private List<AirfieldJsonModel> airfields;
    private AttackJsonModel attack;
    private Boolean controllable;
    private List<CreateEnvJsonModel> createEnvs;
    private DeathabilityJsonModel deathability;
    private HealJsonModel heal;
    private Integer hiddenInFows;
    private MovementJsonModel movement;
    private IncomeJsonModel income;
    private Integer openFows;
    private Boolean parentMustIdle;
    private Map<String, Object> passability;
    @JsonProperty("scale_")
    private Integer scale;
    private Long searchTags;
    private Integer size;
    private Integer storageMultiplier;
    private SupplyJsonModel supply;
    private Long tags;
    private TransportJsonModel transport;
    private Integer viewRange;
    private ZoneEventJsonModel zoneEvent;
    private Object paths;
}

