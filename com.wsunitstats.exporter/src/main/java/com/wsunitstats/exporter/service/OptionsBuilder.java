package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.option.NationOption;
import com.wsunitstats.exporter.model.exported.option.ResearchOption;
import com.wsunitstats.exporter.model.exported.option.ResearchTypeOption;
import com.wsunitstats.exporter.model.exported.option.TagOption;
import com.wsunitstats.exporter.model.exported.option.UnitOption;

import java.util.Collection;
import java.util.List;

public interface OptionsBuilder {
    Collection<UnitOption> buildUnitOptions(List<UnitModel> unitModels);

    Collection<ResearchOption> buildResearchOptions(List<ResearchModel> researchModels);

    Collection<ResearchTypeOption> buildResearchTypeOptions();

    Collection<String> buildLocaleOptions(List<LocalizationModel> localizationModels);

    Collection<TagOption> buildUnitTagOptions(List<UnitModel> unitModels);

    Collection<TagOption> buildSearchTagOptions(List<UnitModel> unitModels);

    Collection<NationOption> buildNationsOptions(List<UnitModel> unitModels);
}
