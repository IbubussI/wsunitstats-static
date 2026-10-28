package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import com.wsunitstats.exporter.service.serializer.FloatPrecision;
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
    // %/sec, not rounded: the game value (progress) is restored from it to apply research upgrades
    @FloatPrecision(0)
    private Double constructionSpeed;
    @FloatPrecision(0)
    private Double constructionSpeedOnOwnTerritory;
}
