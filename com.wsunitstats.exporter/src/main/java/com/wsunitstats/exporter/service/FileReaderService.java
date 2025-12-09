package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;

import java.io.File;
import java.util.List;

public interface FileReaderService {
    <T> T readJson(String path, Class<T> clazz);

    List<LocalizationFileModel> readLocalizations(String... paths);

    LocalizationFileModel readLocalization(File file);

    SessionInitFileModel readSessionInitLua(String path);

    OnProjectLoadFileModel readOnProjectLoadLua(String path);

    CulturesFileModel readCulturesLua(String path);
}
