package com.wsunitstats.exporter.model.exported.submodel.research;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@ToString
public class UnitResearchUpgrade {
    private Map<String, String> parameters;
    private int programId;
}
