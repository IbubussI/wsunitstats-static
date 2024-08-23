package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;

import java.util.List;

public interface ModelBuilder {
    List<UnitModel> buildUnits();
    List<ResearchModel> buildResearches();
}
