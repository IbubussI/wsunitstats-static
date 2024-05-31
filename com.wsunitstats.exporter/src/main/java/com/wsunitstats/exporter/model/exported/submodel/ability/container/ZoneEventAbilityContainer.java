package com.wsunitstats.exporter.model.exported.submodel.ability.container;

import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import com.wsunitstats.exporter.model.exported.submodel.ability.GenericAbility;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class ZoneEventAbilityContainer extends GenericAbilityContainer {
    private List<GenericAbility> abilities;
    private List<TagModel> envTags;
    private Integer envSearchDistance;
    private Integer size;
}
