package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.exception.GameFilesResolvingException;
import com.wsunitstats.exporter.model.FilePathWrapper;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.model.json.gameplay.GameplayFileJsonModel;
import com.wsunitstats.exporter.model.json.main.MainFileJsonModel;
import com.wsunitstats.exporter.model.json.visual.VisualFileJsonModel;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.MainStartupFileModel;
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
    private MainStartupFileModel mainStartupFileModel;
    private List<LocalizationFileModel> localizationFileModels;
    private Map<String, BufferedImage> images;
    private LocalizationKeyModel localizationKeyModel;

    @Autowired
    private FileReaderService fileReaderService;
    @Autowired
    private FilePathResolver filePathResolver;
    @Autowired
    private ImageService imageService;

    @Value("${com.wsunitstats.exporter.warselection.unit.types.number}")
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
    public MainStartupFileModel getMainStartupFileModel() {
        return mainStartupFileModel;
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
        mainStartupFileModel = fileReaderService.readMainStartupLua(filePathWrapper.getMainStartupFilePath());
        localizationFileModels = fileReaderService.readLocalizations(filePathWrapper.getLocalizationFolderPath());
        images = imageService.resolveImages(mainFileModel, filePathWrapper.getRootFolderPath());
        localizationKeyModel = getLocalizationKeyModel(sessionInitFileModel, mainStartupFileModel);
    }

    private LocalizationKeyModel getLocalizationKeyModel(SessionInitFileModel sessionInitSource, MainStartupFileModel mainStartupSource) {
        LocalizationKeyModel localizationModel = new LocalizationKeyModel();
        localizationModel.setNationNames(convertToNationNames(mainStartupSource.getUnitGroupsNames()));
        localizationModel.setResearchNames(generateByIds(RESEARCH_NAME_LOCALIZATION_PREFIX, RESEARCH_NAME_LOCALIZATION_POSTFIX));
        localizationModel.setResearchTexts(generateByIds(RESEARCH_TEXT_LOCALIZATION_PREFIX, RESEARCH_TEXT_LOCALIZATION_POSTFIX));
        localizationModel.setUnitNames(generateByIds(UNIT_NAME_LOCALIZATION_PREFIX, UNIT_NAME_LOCALIZATION_POSTFIX));
        localizationModel.setUnitTexts(generateByIds(UNIT_TEXT_LOCALIZATION_PREFIX, UNIT_TEXT_LOCALIZATION_POSTFIX));
        localizationModel.setUnitTagNames(convertToLocalizationTags(mainStartupSource.getUnitTagNames()));
        localizationModel.setUnitSearchTagNames(convertToLocalizationTags(mainStartupSource.getUnitSearchTagNames()));
        localizationModel.setEnvNames(convertToLocalizationTagMap(mainStartupSource.getEnvNames()));
        localizationModel.setEnvTagNames(convertToLocalizationTags(mainStartupSource.getEnvTagNames()));
        localizationModel.setEnvSearchTagNames(convertToLocalizationTags(mainStartupSource.getEnvSearchTagNames()));
        localizationModel.setAgeNames(convertToLocalizationTags(sessionInitSource.getAgeNames()));
        localizationModel.setResourceNames(convertToLocalizationTags(mainStartupSource.getResourceNames()));
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
