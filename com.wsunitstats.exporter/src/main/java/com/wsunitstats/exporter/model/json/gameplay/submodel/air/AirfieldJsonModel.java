package com.wsunitstats.exporter.model.json.gameplay.submodel.air;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class AirfieldJsonModel {
    private List<AirfieldContainerEntryJsonModel> container;
}
