package com.wsunitstats.exporter.model.exported.submodel.weapon;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class BuffModel {
    private int buffId;
    private EntityInfoModel entityInfo;
    private Double period;
    private List<TagModel> affectedUnits;
}
