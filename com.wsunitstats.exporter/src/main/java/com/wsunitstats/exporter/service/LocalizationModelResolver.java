package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;

public interface LocalizationModelResolver {
    LocalizationModel resolveFromJsonModel(LocalizationFileModel localizationFileModel);
}
