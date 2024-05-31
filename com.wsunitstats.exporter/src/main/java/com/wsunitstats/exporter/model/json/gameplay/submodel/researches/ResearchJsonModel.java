package com.wsunitstats.exporter.model.json.gameplay.submodel.researches;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class ResearchJsonModel {
    private List<Integer> upgrades;
}
