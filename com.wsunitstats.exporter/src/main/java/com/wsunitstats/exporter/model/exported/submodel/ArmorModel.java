package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.service.serializer.FloatPrecision;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ArmorModel {
    // exact game value (thousandths), needed to apply research upgrades to it
    @FloatPrecision(3)
    private Double value;
    private Integer probability;
}

