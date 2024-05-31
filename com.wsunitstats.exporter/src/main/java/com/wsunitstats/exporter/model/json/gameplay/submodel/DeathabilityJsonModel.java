package com.wsunitstats.exporter.model.json.gameplay.submodel;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class DeathabilityJsonModel {
    @JsonProperty("armor_")
    private ArmorJsonModel armor;
    private Map<String, Object> attackReaction;
    private List<Object> corpses;
    private List<Integer> healMeCost;
    private Integer health;
    private Integer lifeTime;
    private Boolean receiveFriendlyDamage;
    private Integer regeneration;
    private Integer threat;
}
