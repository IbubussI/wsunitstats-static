package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class AirplaneModel {
    private Double healingSpeed;
    private Double refuelSpeed;
    private Double rechargePeriod;
    private List<TagModel> aerodromeTags;
    // In seconds of fly time
    private Double fuel;
    private Double flyHeight;
    private Boolean kamikaze;
    private Integer ascensionSpeed;
}
