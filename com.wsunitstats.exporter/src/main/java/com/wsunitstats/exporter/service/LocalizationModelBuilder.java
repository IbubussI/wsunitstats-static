package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;

public interface LocalizationModelBuilder {
    LocalizationModel buildFromFileModel(LocalizationFileModel localizationFileModel);
}
