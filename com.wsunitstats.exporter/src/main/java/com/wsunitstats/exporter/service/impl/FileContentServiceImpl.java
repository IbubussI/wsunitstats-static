package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.exception.GameFilesResolvingException;
import com.wsunitstats.exporter.model.FilePathWrapper;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.model.json.gameplay.GameplayFileJsonModel;
import com.wsunitstats.exporter.model.json.main.MainFileJsonModel;
import com.wsunitstats.exporter.model.json.visual.VisualFileJsonModel;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.FilePathResolver;
import com.wsunitstats.exporter.service.FileReaderService;
import com.wsunitstats.exporter.service.ImageService;
import jakarta.annotation.PostConstruct;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.wsunitstats.exporter.utils.Utils.convertToLocalizationTagMap;
import static com.wsunitstats.exporter.utils.Utils.convertToLocalizationTags;
import static com.wsunitstats.exporter.utils.Utils.convertToNationNames;

@Service
@PropertySource(value = "classpath:exporter.properties")
@PropertySource(value = "file:config/exporter.properties", ignoreResourceNotFound = true)
public class FileContentServiceImpl implements FileContentService {
    private static final Logger LOG = LogManager.getLogger(FileContentServiceImpl.class);
    private static final String UNIT_NAME_LOCALIZATION_PREFIX = "<*unitName";
    private static final String UNIT_NAME_LOCALIZATION_POSTFIX = ">";
    private static final String UNIT_TEXT_LOCALIZATION_PREFIX = "<*unitText";
    private static final String UNIT_TEXT_LOCALIZATION_POSTFIX = ">";
    private static final String RESEARCH_NAME_LOCALIZATION_PREFIX = "<*upgrade";
    private static final String RESEARCH_NAME_LOCALIZATION_POSTFIX = "/0>";
    private static final String RESEARCH_TEXT_LOCALIZATION_PREFIX = "<*upgrade";
    private static final String RESEARCH_TEXT_LOCALIZATION_POSTFIX = "/1>";

    private GameplayFileJsonModel gameplayFileModel;
    private MainFileJsonModel mainFileModel;
    private VisualFileJsonModel visualFileModel;

    private SessionInitFileModel sessionInitFileModel;
    private CulturesFileModel culturesFileModel;
    private OnProjectLoadFileModel onProjectLoadFileModel;

    private List<LocalizationFileModel> localizationFileModels;
    private Map<String, BufferedImage> images;
    private LocalizationKeyModel localizationKeyModel;

    @Autowired
    private FileReaderService fileReaderService;
    @Autowired
    private FilePathResolver filePathResolver;
    @Autowired
    private ImageService imageService;

    @Value("${warselection.unit.types.number}")
    private int unitTypesNumber;

    @Override
    public GameplayFileJsonModel getGameplayFileModel() {
        return gameplayFileModel;
    }

    @Override
    public MainFileJsonModel getMainFileModel() {
        return mainFileModel;
    }

    @Override
    public VisualFileJsonModel getVisualFileModel() {
        return visualFileModel;
    }

    @Override
    public SessionInitFileModel getSessionInitFileModel() {
        return sessionInitFileModel;
    }

    @Override
    public OnProjectLoadFileModel getOnProjectLoadFileModel() {
        return onProjectLoadFileModel;
    }

    @Override
    public CulturesFileModel getCulturesFileModel() {
        return culturesFileModel;
    }

    @Override
    public List<LocalizationFileModel> getLocalizationFileModels() {
        return localizationFileModels;
    }

    @Override
    public Map<String, BufferedImage> getImages() {
        return images;
    }

    @Override
    public LocalizationKeyModel getLocalizationKeyModel() {
        return localizationKeyModel;
    }

    @PostConstruct
    protected void postConstruct() throws IOException, GameFilesResolvingException {
        LOG.info("Resolving game files...");
        FilePathWrapper filePathWrapper = filePathResolver.resolve();
        LOG.info("Game files resolved at the next folder: [{}] ", filePathWrapper.getRootFolderPath());

        LOG.info("Reading game files...");
        gameplayFileModel = fileReaderService.readJson(filePathWrapper.getGameplayFilePath(), GameplayFileJsonModel.class);
        mainFileModel = fileReaderService.readJson(filePathWrapper.getMainFilePath(), MainFileJsonModel.class);
        visualFileModel= fileReaderService.readJson(filePathWrapper.getVisualFilePath(), VisualFileJsonModel.class);
        sessionInitFileModel = fileReaderService.readSessionInitLua(filePathWrapper.getSessionInitFilePath());
        onProjectLoadFileModel = fileReaderService.readOnProjectLoadLua(filePathWrapper.getOnProjectLoadFilePath());
        culturesFileModel = fileReaderService.readCulturesLua(filePathWrapper.getCulturesFilePath());
        localizationFileModels = fileReaderService.readLocalizations(filePathWrapper.getLocalizationFolderPath());
        images = imageService.resolveImages(mainFileModel, filePathWrapper.getRootFolderPath());
        localizationKeyModel = generateLocalizationKeyModel();
    }

    private LocalizationKeyModel generateLocalizationKeyModel() {
        LocalizationKeyModel localizationModel = new LocalizationKeyModel();
        localizationModel.setNationNames(convertToNationNames(culturesFileModel.getNationNames()));
        localizationModel.setResearchNames(generateByIds(RESEARCH_NAME_LOCALIZATION_PREFIX, RESEARCH_NAME_LOCALIZATION_POSTFIX));
        localizationModel.setResearchTexts(generateByIds(RESEARCH_TEXT_LOCALIZATION_PREFIX, RESEARCH_TEXT_LOCALIZATION_POSTFIX));
        localizationModel.setUnitNames(generateByIds(UNIT_NAME_LOCALIZATION_PREFIX, UNIT_NAME_LOCALIZATION_POSTFIX));
        localizationModel.setUnitTexts(generateByIds(UNIT_TEXT_LOCALIZATION_PREFIX, UNIT_TEXT_LOCALIZATION_POSTFIX));
        localizationModel.setUnitTagNames(convertToLocalizationTags(onProjectLoadFileModel.getUnitTagNames()));
        localizationModel.setUnitSearchTagNames(convertToLocalizationTags(onProjectLoadFileModel.getUnitSearchTagNames()));
        localizationModel.setEnvNames(convertToLocalizationTagMap(onProjectLoadFileModel.getEnvNames()));
        localizationModel.setEnvTagNames(convertToLocalizationTags(onProjectLoadFileModel.getEnvTagNames()));
        localizationModel.setEnvSearchTagNames(convertToLocalizationTags(onProjectLoadFileModel.getEnvSearchTagNames()));
        localizationModel.setAgeNames(convertToLocalizationTags(sessionInitFileModel.getAgeNames()));
        localizationModel.setResourceNames(convertToLocalizationTags(onProjectLoadFileModel.getResourceNames()));
        return localizationModel;
    }

    private List<String> generateByIds(String prefix, String postfix) {
        List<String> result = new ArrayList<>(unitTypesNumber);
        for (int i = 0; i < unitTypesNumber; i++) {
            result.add(prefix + i + postfix);
        }
        return result;
    }
}
