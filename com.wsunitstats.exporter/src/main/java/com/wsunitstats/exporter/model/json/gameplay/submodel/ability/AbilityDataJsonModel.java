package com.wsunitstats.exporter.model.json.gameplay.submodel.ability;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DamageJsonModel;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.service.serializer.EntityRefDeserializer;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

// extends damage json model because can have all it props for damage ability
@Getter
@Setter
@ToString
public class AbilityDataJsonModel extends DamageJsonModel {
    // targets of the ability
    private Boolean ally;
    private Boolean enemy;

    private Integer count;
    private String clearTasks;

    //Warrior speed increase, heavy tanks decrease (when breaking forest) duration
    private Integer duration;

    //One of next ids is present
    private Integer id;         //index in the unit createEnvs (for e.g. wheat) or damage id - ??? for damage
    @JsonDeserialize(using = EntityRefDeserializer.Research.class)
    private EntityId research;  //research id
    @JsonDeserialize(using = EntityRefDeserializer.Unit.class)
    private EntityId unit;       //unit id

    //Wall-specific
    private Integer checkPassability;
    private Integer clearLimitMin;
    private Integer clearUnits;

    //LimitedLife (sakura blossom, durga fury etc)
    private Integer lifeTime;
    private Boolean mustBeSent;
    private Boolean sendStrict;

    //paratroopers
    private String parameters;
    private Integer enoughDistance;

    //unit damage circle
    private List<Integer> displacement;
    private Integer moveDistance;
    @JsonAlias({"radius", "radius_"})
    private Integer radius;
    private Long tags;
    private Long tagsExclude;
}
