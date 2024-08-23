package com.wsunitstats.exporter.model.json.gameplay.submodel.air;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AirfieldContainerEntryJsonModel {
    private Integer height;
    private Boolean on;
    private Integer pathLanding;
    private Integer pathTakeoff;
}
