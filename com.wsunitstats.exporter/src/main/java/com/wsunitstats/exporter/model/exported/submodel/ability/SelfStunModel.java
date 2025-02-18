package com.wsunitstats.exporter.model.exported.submodel.ability;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * used only for dance in the game
 */
@Getter
@Setter
@ToString
public class SelfStunModel extends GenericAbility {
    private Double duration;
}
