package com.wsunitstats.exporter.model.exported.submodel.ability.container;

import com.wsunitstats.exporter.model.exported.submodel.ability.IconAbilityModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Abilities shown as icons: on action, zone event and the ones triggered by weapons or game scripts
 */
@Getter
@Setter
@ToString
public class IconAbilityContainer extends GenericAbilityContainer {
    private List<IconAbilityModel> abilities;
}
