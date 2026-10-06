package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityProvider;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.model.json.gameplay.GameplayFileJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.EnvJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.ProjectileJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.UnitJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.ResearchJsonModel;
import com.wsunitstats.exporter.model.json.gameplay.submodel.researches.UpgradeJsonModel;
import com.wsunitstats.exporter.model.json.visual.submodel.UnitTypeJsonModel;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;

import java.awt.image.BufferedImage;
import java.util.List;
import java.util.Map;

/**
 * Content of the game files. Game entities are accessed through providers, so the rest of the exporter
 * does not depend on the way the game identifies them.
 */
public interface FileContentService {
    GameplayFileJsonModel getGameplayFileModel();

    /**
     * @return gameplay data of the units
     */
    EntityProvider<UnitJsonModel> getUnits();

    /**
     * @return visual data of the units, by the same ids as {@link #getUnits()}
     */
    EntityProvider<UnitTypeJsonModel> getUnitTypes();

    EntityProvider<EnvJsonModel> getEnvs();

    EntityProvider<ProjectileJsonModel> getProjectiles();

    EntityProvider<ResearchJsonModel> getResearches();

    EntityProvider<UpgradeJsonModel> getUpgrades();

    /**
     * @return nation id by unit id, for the units which belong to a nation
     */
    Map<EntityId, Integer> getUnitNations();

    SessionInitFileModel getSessionInitFileModel();

    OnProjectLoadFileModel getOnProjectLoadFileModel();

    CulturesFileModel getCulturesFileModel();

    List<LocalizationFileModel> getLocalizationFileModels();

    Map<String, BufferedImage> getImages();

    LocalizationKeyModel getLocalizationKeyModel();
}
