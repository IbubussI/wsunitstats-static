package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.deser.DeserializationProblemHandler;
import com.wsunitstats.exporter.content.JsonMergePatch;
import com.wsunitstats.exporter.content.entity.IndexEntityProvider;
import com.wsunitstats.exporter.content.entity.PathEntityProvider;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityKind;
import com.wsunitstats.exporter.entity.EntityProvider;
import com.wsunitstats.exporter.entity.EntityReferences;
import com.wsunitstats.exporter.exception.FileReadingException;
import com.wsunitstats.exporter.exception.GameFilesResolvingException;
import com.wsunitstats.exporter.model.FilePathWrapper;
import com.wsunitstats.exporter.model.ImageSource;
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
import com.wsunitstats.exporter.model.lua.EnvNamesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.ResearchIconsFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.FilePathResolver;
import com.wsunitstats.exporter.service.FileReaderService;
import com.wsunitstats.exporter.service.ImageService;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Utils;
import jakarta.annotation.PostConstruct;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;

import static com.wsunitstats.exporter.utils.Utils.convertToNationNames;

/**
 * Reads the game files and is the only part of the exporter which knows how the game identifies
 * each kind of entities: units, envs and projectiles by path, researches and upgrades by index.
 */
@Service
@PropertySource(value = "classpath:exporter.properties")
@PropertySource(value = "file:config/exporter.properties", ignoreResourceNotFound = true)
public class FileContentServiceImpl implements FileContentService {
    private static final Logger LOG = LogManager.getLogger(FileContentServiceImpl.class);
    private static final String UNIT_NAME_LOCALIZATION_PREFIX = "<*unitName";
    private static final String UNIT_NAME_LOCALIZATION_POSTFIX = ">";
    private static final String UNIT_TEXT_LOCALIZATION_PREFIX = "<*unitText";
    private static final String UNIT_TEXT_LOCALIZATION_POSTFIX = ">";
    /** Research localization entry: "<*upgrade{id}>name|description" */
    private static final String RESEARCH_LOCALIZATION_PREFIX = "<*upgrade";
    private static final String RESEARCH_LOCALIZATION_POSTFIX = ">";
    private static final int RESEARCH_NAME_LOCALIZATION_PART = 0;
    private static final int RESEARCH_TEXT_LOCALIZATION_PART = 1;
    private static final String ENV_NAME_LOCALIZATION_PREFIX = "<*envName";
    private static final String ENV_NAME_LOCALIZATION_POSTFIX = ">";
    private static final String LOCALIZATION_FILE_EXTENSION = ".loc";
    /** Placeholder of the entity id in the localization keys of the content packs, e.g. "unitName{id}" */
    private static final String LOCALIZATION_ID_PLACEHOLDER = "{id}";

    private static final String UNIT_PACK_FILE = "unit.json";
    private static final String ENV_PACK_FILE = "env.json";
    private static final String PROJECTILE_PACK_FILE = "projectile.json";
    private static final String PACK_ICON_FILE = "icon.ktx2";
    private static final String GAMEPLAY_NODE = "gameplay";
    private static final String VISUAL_NODE = "visual";
    private static final String LOCALIZATION_NODE = "localization";
    private static final String ICON_NODE = "icon";
    private static final String VERSION_NODE = "version";

    private String gameVersion;
    private GameplayFileJsonModel gameplayFileModel;
    private PathEntityProvider<UnitJsonModel> units;
    private PathEntityProvider<UnitTypeJsonModel> unitTypes;
    private PathEntityProvider<EnvJsonModel> envs;
    private PathEntityProvider<ProjectileJsonModel> projectiles;
    private IndexEntityProvider<ResearchJsonModel> researches;
    private IndexEntityProvider<UpgradeJsonModel> upgrades;
    private Map<EntityId, Integer> unitNations;
    private Set<EntityId> danceUnits;

    private SessionInitFileModel sessionInitFileModel;
    private CulturesFileModel culturesFileModel;
    private OnProjectLoadFileModel onProjectLoadFileModel;
    private EnvNamesFileModel envNamesFileModel;

    private List<LocalizationFileModel> localizationFileModels;
    private Map<String, BufferedImage> images;
    private LocalizationKeyModel localizationKeyModel;

    @Autowired
    private FileReaderService fileReaderService;
    @Autowired
    private FilePathResolver filePathResolver;
    @Autowired
    private ImageService imageService;

    @Value("${warselection.content.namespace}")
    private String contentNamespace;

    @Override
    public GameplayFileJsonModel getGameplayFileModel() {
        return gameplayFileModel;
    }

    @Override
    public EntityProvider<UnitJsonModel> getUnits() {
        return units;
    }

    @Override
    public EntityProvider<UnitTypeJsonModel> getUnitTypes() {
        return unitTypes;
    }

    @Override
    public EntityProvider<EnvJsonModel> getEnvs() {
        return envs;
    }

    @Override
    public EntityProvider<ProjectileJsonModel> getProjectiles() {
        return projectiles;
    }

    @Override
    public EntityProvider<ResearchJsonModel> getResearches() {
        return researches;
    }

    @Override
    public EntityProvider<UpgradeJsonModel> getUpgrades() {
        return upgrades;
    }

    @Override
    public Set<EntityId> getDanceUnits() {
        return danceUnits;
    }

    @Override
    public Map<EntityId, Integer> getUnitNations() {
        return unitNations;
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

    @Override
    public String getGameVersion() {
        return gameVersion;
    }

    @PostConstruct
    protected void postConstruct() throws IOException, GameFilesResolvingException {
        LOG.info("Resolving game files...");
        FilePathWrapper filePathWrapper = filePathResolver.resolve();
        LOG.info("Game files resolved at the next folder: [{}] ", filePathWrapper.getRootFolderPath());

        LOG.info("Reading game files...");
        JsonNode gameplayTree = fileReaderService.readJsonTree(filePathWrapper.getGameplayFilePath());
        JsonNode visualTree = fileReaderService.readJsonTree(filePathWrapper.getVisualFilePath());
        sessionInitFileModel = fileReaderService.readSessionInitLua(filePathWrapper.getSessionInitFilePath());
        onProjectLoadFileModel = fileReaderService.readOnProjectLoadLua(filePathWrapper.getOnProjectLoadFilePath());
        culturesFileModel = fileReaderService.readCulturesLua(filePathWrapper.getCulturesFilePath());
        envNamesFileModel = fileReaderService.readEnvNamesLua(filePathWrapper.getEnvNamesFilePath());
        ResearchIconsFileModel researchIconsFileModel = fileReaderService.readResearchIconsLua(filePathWrapper.getResearchIconsFilePath());
        localizationFileModels = fileReaderService.readLocalizations(filePathWrapper.getLocalizationFolderPath());

        LOG.info("Reading game content packs...");
        Map<String, Map<String, byte[]>> unitPacks = fileReaderService.readPacks(filePathWrapper.getUnitsContentFolderPath(), contentNamespace);
        Map<String, Map<String, byte[]>> envPacks = fileReaderService.readPacks(filePathWrapper.getEnvsContentFolderPath(), contentNamespace);
        Map<String, Map<String, byte[]>> projectilePacks = fileReaderService.readPacks(filePathWrapper.getProjectilesContentFolderPath(), contentNamespace);
        LOG.info("Content packs read: {} units, {} envs, {} projectiles", unitPacks.size(), envPacks.size(), projectilePacks.size());

        // Identifiers of all the entities are known before reading them, so the references between them
        // can be resolved while reading. Content entities are identified by path, the gameplay lists by index.
        units = new PathEntityProvider<>(EntityKind.UNIT, unitPacks.keySet());
        unitTypes = new PathEntityProvider<>(EntityKind.UNIT, unitPacks.keySet());
        envs = new PathEntityProvider<>(EntityKind.ENV, envPacks.keySet());
        projectiles = new PathEntityProvider<>(EntityKind.PROJECTILE, projectilePacks.keySet());
        researches = new IndexEntityProvider<>(EntityKind.RESEARCH, gameplayTree.path("researches").path("list").size());
        upgrades = new IndexEntityProvider<>(EntityKind.UPGRADE, gameplayTree.path("researches").path("upgrades").size());

        UnknownPropertiesCollector unknownProperties = new UnknownPropertiesCollector();
        ObjectReader reader = new ObjectMapper().addHandler(unknownProperties).reader()
                .withAttribute(EntityKind.UNIT, units)
                .withAttribute(EntityKind.ENV, envs)
                .withAttribute(EntityKind.PROJECTILE, projectiles)
                .withAttribute(EntityKind.RESEARCH, researches)
                .withAttribute(EntityKind.UPGRADE, upgrades);
        gameplayFileModel = readValue(reader, gameplayTree, GameplayFileJsonModel.class, "gameplay.json");
        gameVersion = readGameVersion(filePathWrapper);
        LOG.info("Game version: {}", gameVersion);
        researches.setAll(gameplayFileModel.getResearches().getList());
        upgrades.setAll(gameplayFileModel.getResearches().getUpgrades());

        Map<String, LocalizationFileModel> localizationsByLocale = new LinkedHashMap<>();
        localizationFileModels.forEach(model -> localizationsByLocale.put(
                model.getFilename().substring(0, model.getFilename().length() - LOCALIZATION_FILE_EXTENSION.length()), model));
        Map<String, ImageSource> imageSources = new LinkedHashMap<>();

        readUnits(unitPacks, gameplayTree.path("scenes").path("unitOverrides"), visualTree.path("unitOverrides"),
                reader, localizationsByLocale, imageSources);
        readEnvs(envPacks, reader, localizationsByLocale, imageSources);
        readProjectiles(projectilePacks, reader);
        unknownProperties.check();

        unitNations = resolveByReference(units, culturesFileModel.getUnitNationsByAddress(), "unit nation");
        List<String> danceUnitAddresses = fileReaderService.readDanceUnitsLua(filePathWrapper.getSessionStartFilePath());
        danceUnits = danceUnitAddresses == null ? null : EntityReferences.resolveAll(units, danceUnitAddresses);
        resolveByReference(researches, researchIconsFileModel.getResearchIcons(), "research icon").forEach((researchId, asset) ->
                imageSources.put(imageService.getImageName(Constants.EntityType.UPGRADE.getName(), researchId), ImageSource.ofAsset(asset)));
        Arrays.stream(Constants.ResourceIcon.values()).forEach(resource -> imageSources.put(
                imageService.getImageName(Constants.EntityType.RESOURCE.getName(), resource.getGameId()), ImageSource.ofAsset(resource.getAsset())));

        LOG.info("Reading images...");
        images = imageService.resolveImages(imageSources, filePathWrapper.getUiContentFolderPath());
        if (images.size() < imageSources.size()) {
            LOG.warn("{} of {} images could not be read", imageSources.size() - images.size(), imageSources.size());
        }
        localizationKeyModel = generateLocalizationKeyModel();
    }

    private String readGameVersion(FilePathWrapper filePathWrapper) throws IOException {
        String engineVersion = Files.readString(Path.of(filePathWrapper.getEngineVersionFilePath())).trim();
        String mainVersion = fileReaderService.readJsonTree(filePathWrapper.getMainFilePath()).path(VERSION_NODE).asText();
        return engineVersion + "." + gameplayFileModel.getVersion() + "_" + mainVersion;
    }

    private void readUnits(Map<String, Map<String, byte[]>> packs,
                           JsonNode gameplayOverrides,
                           JsonNode visualOverrides,
                           ObjectReader reader,
                           Map<String, LocalizationFileModel> localizations,
                           Map<String, ImageSource> imageSources) {
        warnAboutUnknownOverrides(gameplayOverrides, packs, "gameplay");
        warnAboutUnknownOverrides(visualOverrides, packs, "visual");
        packs.forEach((address, pack) -> {
            EntityId id = units.resolve(address);
            JsonNode unitTree = readPackJson(pack, UNIT_PACK_FILE, address);
            JsonNode gameplay = JsonMergePatch.apply(unitTree.get(GAMEPLAY_NODE), gameplayOverrides.get(address));
            JsonNode visual = JsonMergePatch.apply(unitTree.get(VISUAL_NODE), visualOverrides.get(address));
            units.set(address, readValue(reader, gameplay, UnitJsonModel.class, address));
            UnitTypeJsonModel unitType = readValue(reader, visual, UnitTypeJsonModel.class, address);
            unitTypes.set(address, unitType);
            addLocalization(localizations, unitTree.get(LOCALIZATION_NODE), id, address);
            addIcon(imageSources, Constants.EntityType.UNIT.getName(), id, pack, unitType.getIcon(), address);
        });
    }

    private void readEnvs(Map<String, Map<String, byte[]>> packs,
                          ObjectReader reader,
                          Map<String, LocalizationFileModel> localizations,
                          Map<String, ImageSource> imageSources) {
        packs.forEach((address, pack) -> {
            EntityId id = envs.resolve(address);
            JsonNode envTree = readPackJson(pack, ENV_PACK_FILE, address);
            envs.set(address, readValue(reader, envTree.get(GAMEPLAY_NODE), EnvJsonModel.class, address));
            addLocalization(localizations, envTree.get(LOCALIZATION_NODE), id, address);
            JsonNode icon = envTree.path(VISUAL_NODE).get(ICON_NODE);
            addIcon(imageSources, Constants.EntityType.ENV.getName(), id, pack, icon != null ? icon.asText() : null, address);
        });
    }

    private void readProjectiles(Map<String, Map<String, byte[]>> packs, ObjectReader reader) {
        packs.forEach((address, pack) -> {
            JsonNode projectileTree = readPackJson(pack, PROJECTILE_PACK_FILE, address);
            projectiles.set(address, readValue(reader, projectileTree.get(GAMEPLAY_NODE), ProjectileJsonModel.class, address));
        });
    }

    private JsonNode readPackJson(Map<String, byte[]> pack, String fileName, String address) {
        byte[] bytes = pack.get(fileName);
        if (bytes == null) {
            throw new FileReadingException("Content pack " + address + " does not contain " + fileName);
        }
        try {
            return new ObjectMapper().readTree(bytes);
        } catch (IOException e) {
            throw new FileReadingException("Reading " + fileName + " of content pack " + address + " failed", e);
        }
    }

    private <T> T readValue(ObjectReader reader, JsonNode node, Class<T> clazz, String source) {
        try {
            return reader.forType(clazz).readValue(node);
        } catch (IOException e) {
            throw new FileReadingException("Mapping " + clazz.getSimpleName() + " of " + source + " failed: " + e.getMessage(), e);
        }
    }

    /**
     * Converts a map keyed by references to entities (as the game scripts hold them) to a map keyed by entity ids.
     * Entries referencing absent entities are skipped.
     */
    private <K, V> Map<EntityId, V> resolveByReference(EntityProvider<?> provider, Map<K, V> byReference, String what) {
        Map<EntityId, V> result = new LinkedHashMap<>();
        Set<K> unknown = new TreeSet<>();
        byReference.forEach((reference, value) -> {
            Optional<EntityId> id = provider.find(String.valueOf(reference));
            id.ifPresentOrElse(entityId -> result.put(entityId, value), () -> unknown.add(reference));
        });
        if (!unknown.isEmpty()) {
            LOG.debug("{} is defined for {} unknown {}: {}", what, unknown.size(), provider.getKind(), unknown);
        }
        return result;
    }

    /**
     * An icon is stored either in the content pack itself or as an interface image asset referenced by the entity
     */
    private void addIcon(Map<String, ImageSource> imageSources, String entityType, EntityId id,
                         Map<String, byte[]> pack, String iconAsset, String address) {
        String imageName = imageService.getImageName(entityType, id);
        byte[] packIcon = pack.get(PACK_ICON_FILE);
        if (packIcon != null) {
            imageSources.put(imageName, ImageSource.ofTexture(packIcon));
        } else if (iconAsset != null && !iconAsset.isEmpty()) {
            imageSources.put(imageName, ImageSource.ofAsset(iconAsset));
        } else {
            LOG.debug("{} has no icon", address);
        }
    }

    /**
     * Adds the localization of a content entity (e.g. "unitName{id}" -> "Slinger") to the localization
     * of the corresponding locale, under the key the rest of the localization refers to it by
     */
    private void addLocalization(Map<String, LocalizationFileModel> localizations, JsonNode localizationNode, EntityId id, String address) {
        if (localizationNode == null) {
            return;
        }
        Iterator<Map.Entry<String, JsonNode>> locales = localizationNode.fields();
        while (locales.hasNext()) {
            Map.Entry<String, JsonNode> locale = locales.next();
            LocalizationFileModel localization = localizations.get(locale.getKey());
            if (localization == null) {
                LOG.debug("{} has localization for unknown locale {}", address, locale.getKey());
                continue;
            }
            Iterator<Map.Entry<String, JsonNode>> entries = locale.getValue().fields();
            while (entries.hasNext()) {
                Map.Entry<String, JsonNode> entry = entries.next();
                String key = "<*" + entry.getKey().replace(LOCALIZATION_ID_PLACEHOLDER, id.toString()) + ">";
                // every pack entry is a single value: unlike in .loc files, "|" is not a part separator there
                localization.getValues().put(key, List.of(entry.getValue().asText()));
            }
        }
    }

    private void warnAboutUnknownOverrides(JsonNode overrides, Map<String, Map<String, byte[]>> packs, String type) {
        overrides.fieldNames().forEachRemaining(address -> {
            if (!packs.containsKey(address)) {
                LOG.warn("There is a {} override for unknown unit: {}", type, address);
            }
        });
    }

    private LocalizationKeyModel generateLocalizationKeyModel() {
        LocalizationKeyModel localizationModel = new LocalizationKeyModel();
        localizationModel.setNationNames(convertToNationNames(culturesFileModel.getNationNames()));
        localizationModel.setResearchNames(generateKeys(researches, id -> Utils.getLocalizationPartKey(RESEARCH_LOCALIZATION_PREFIX + id + RESEARCH_LOCALIZATION_POSTFIX, RESEARCH_NAME_LOCALIZATION_PART)));
        localizationModel.setResearchTexts(generateKeys(researches, id -> Utils.getLocalizationPartKey(RESEARCH_LOCALIZATION_PREFIX + id + RESEARCH_LOCALIZATION_POSTFIX, RESEARCH_TEXT_LOCALIZATION_PART)));
        localizationModel.setUnitNames(generateKeys(units, id -> UNIT_NAME_LOCALIZATION_PREFIX + id + UNIT_NAME_LOCALIZATION_POSTFIX));
        localizationModel.setUnitTexts(generateKeys(units, id -> UNIT_TEXT_LOCALIZATION_PREFIX + id + UNIT_TEXT_LOCALIZATION_POSTFIX));
        localizationModel.setUnitTagNames(onProjectLoadFileModel.getUnitTagNames());
        localizationModel.setUnitSearchTagNames(onProjectLoadFileModel.getUnitSearchTagNames());
        localizationModel.setEnvNames(generateEnvNames());
        localizationModel.setEnvTagNames(onProjectLoadFileModel.getEnvTagNames());
        localizationModel.setEnvSearchTagNames(onProjectLoadFileModel.getEnvSearchTagNames());
        localizationModel.setAgeNames(sessionInitFileModel.getAgeNames());
        localizationModel.setResourceNames(onProjectLoadFileModel.getResourceNames());
        return localizationModel;
    }

    private Map<EntityId, String> generateKeys(EntityProvider<?> provider, Function<EntityId, String> keyGenerator) {
        Map<EntityId, String> result = new LinkedHashMap<>();
        provider.getIds().forEach(id -> result.put(id, keyGenerator.apply(id)));
        return result;
    }

    /**
     * Env names are either shared keys (e.g. all the trees are named "<*envNameTree>")
     * or own keys of the envs, coming from their content packs
     */
    private Map<EntityId, String> generateEnvNames() {
        Map<EntityId, String> result = new LinkedHashMap<>();
        resolveByReference(envs, envNamesFileModel.getEnvNameKeys(), "env name").forEach((id, key) ->
                result.put(id, key != null ? key : ENV_NAME_LOCALIZATION_PREFIX + id + ENV_NAME_LOCALIZATION_POSTFIX));
        return result;
    }

    /**
     * Collects the properties of the game files which the models do not know, so all of them
     * are reported at once instead of failing on the first one
     */
    private static class UnknownPropertiesCollector extends DeserializationProblemHandler {
        private final Set<String> unknownProperties = new TreeSet<>();

        @Override
        public boolean handleUnknownProperty(DeserializationContext context, JsonParser parser, JsonDeserializer<?> deserializer,
                                             Object beanOrClass, String propertyName) throws IOException {
            Class<?> clazz = beanOrClass instanceof Class<?> c ? c : beanOrClass.getClass();
            unknownProperties.add(clazz.getSimpleName() + "." + propertyName);
            parser.skipChildren();
            return true;
        }

        void check() {
            if (!unknownProperties.isEmpty()) {
                LOG.error("Game files contain properties unknown to the models: {}", unknownProperties);
                throw new FileReadingException("Game files contain " + unknownProperties.size() + " properties unknown to the models");
            }
        }
    }
}
