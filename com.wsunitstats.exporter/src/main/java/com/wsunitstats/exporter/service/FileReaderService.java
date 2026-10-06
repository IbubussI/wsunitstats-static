package com.wsunitstats.exporter.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.EnvNamesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.ResearchIconsFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;

import java.io.File;
import java.util.List;
import java.util.Map;

public interface FileReaderService {
    <T> T readJson(String path, Class<T> clazz);

    JsonNode readJsonTree(String path);

    List<LocalizationFileModel> readLocalizations(String... paths);

    LocalizationFileModel readLocalization(File file);

    SessionInitFileModel readSessionInitLua(String path);

    OnProjectLoadFileModel readOnProjectLoadLua(String path);

    CulturesFileModel readCulturesLua(String path);

    EnvNamesFileModel readEnvNamesLua(String path);

    ResearchIconsFileModel readResearchIconsLua(String path);

    /**
     * Reads every content pack under the given folder (recursively)
     *
     * @param folderPath    content folder of a kind of entities (e.g. Content/units/WarSelection)
     * @param addressPrefix prefix of the entity paths in this folder (e.g. WarSelection)
     * @return pack entries (by entry name) by entity path, which is the address prefix followed by
     * the pack file path relative to the folder, without extension (e.g. WarSelection/2/e/archer)
     */
    Map<String, Map<String, byte[]>> readPacks(String folderPath, String addressPrefix);
}
