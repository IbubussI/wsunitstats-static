package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.model.json.gameplay.GameplayFileJsonModel;
import com.wsunitstats.exporter.model.json.main.MainFileJsonModel;
import com.wsunitstats.exporter.model.json.visual.VisualFileJsonModel;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;

import java.awt.image.BufferedImage;
import java.util.List;
import java.util.Map;

public interface FileContentService {
    GameplayFileJsonModel getGameplayFileModel();

    MainFileJsonModel getMainFileModel();

    VisualFileJsonModel getVisualFileModel();

    SessionInitFileModel getSessionInitFileModel();

    OnProjectLoadFileModel getOnProjectLoadFileModel();

    CulturesFileModel getCulturesFileModel();

    List<LocalizationFileModel> getLocalizationFileModels();

    Map<String, BufferedImage> getImages();

    LocalizationKeyModel getLocalizationKeyModel();
}
