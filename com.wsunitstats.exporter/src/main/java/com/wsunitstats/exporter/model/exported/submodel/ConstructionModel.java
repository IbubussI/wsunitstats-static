package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ConstructionModel {
	private Double distance;
    private int constructionId;
    private EntityInfoModel entityInfo;
    // %/sec
    private Double constructionSpeed;
    private Double constructionSpeedOnOwnTerritory;
}
