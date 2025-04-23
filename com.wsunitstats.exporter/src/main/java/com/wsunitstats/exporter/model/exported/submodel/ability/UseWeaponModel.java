package com.wsunitstats.exporter.model.exported.submodel.ability;

import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class UseWeaponModel extends GenericAbility {
    private Boolean ground;
    private Boolean single;
    private List<TagModel> tags;
    private Integer weapon;
}
