package com.wsunitstats.exporter.model.json.gameplay.submodel.ability;

import com.wsunitstats.exporter.model.json.gameplay.submodel.weapon.DamageJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// extends damage json model because can have all it props for damage ability
@Getter
@Setter
@ToString
public class AbilityDataJsonModel extends DamageJsonModel {
    private Integer count;
    private String clearTasks;

    //Warrior speed increase, heavy tanks decrease (when breaking forest) duration
    private Integer duration;

    //One of next ids is present
    private Integer id;         //env id (for e.g. wheat) or damage id - ??? for damage
    private Integer research;   //research id
    private Integer unit;       //unit id

    //Wall-specific
    private Integer checkPassability;
    private Integer clearLimitMin;
    private Integer clearUnits;

    //LimitedLife (sakura blossom, durga fury etc)
    private Integer lifeTime;
    private Boolean mustBeSent;
    private Boolean sendStrict;
}
