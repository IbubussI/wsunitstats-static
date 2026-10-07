package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wsunitstats.exporter.content.GemPackReader;
import com.wsunitstats.exporter.exception.FileReadingException;
import com.wsunitstats.exporter.lua.LuaBytecodeReader;
import com.wsunitstats.exporter.lua.LuaFunctionCall;
import com.wsunitstats.exporter.lua.LuaPrototype;
import com.wsunitstats.exporter.lua.LuaSourceReader;
import com.wsunitstats.exporter.lua.LuaTable;
import com.wsunitstats.exporter.lua.LuaTableExtractor;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.EnvNamesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.ResearchIconsFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;
import com.wsunitstats.exporter.service.FileReaderService;
import com.wsunitstats.exporter.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static com.wsunitstats.exporter.utils.Constants.CLOSING_ANGLE_BRACKET;
import static com.wsunitstats.exporter.utils.Constants.LOCALIZATION_MULTI_VALUE_DELIMITER_REGEX;
import static com.wsunitstats.exporter.utils.Constants.SLASH;

@Service
public class FileReaderServiceImpl implements FileReaderService {
    private static final Logger LOG = LoggerFactory.getLogger(FileReaderServiceImpl.class);

    private static final Pattern LOC_VALUE_PATTERN = Pattern.compile("^(<\\*[^<>]*>)(.*)$", Pattern.MULTILINE);
    private static final String LOC_FILENAME_SUFFIX = ".loc";
    /** Lua function wrapping every localization key in the game scripts */
    private static final String LOCALIZE_FUNCTION = "localize";
    /** Key of a part of a multipart localization entry the way the game scripts write it: "<*key/N>" */
    private static final Pattern GAME_LOCALIZATION_PART_KEY_PATTERN = Pattern.compile("^(<\\*.*)/(\\d+)>$");
    /** Signature compiled Lua chunks start with */
    private static final byte[] LUA_BYTECODE_SIGNATURE = {0x1B, 'L', 'u', 'a'};
    /** Call of session/_start.lua enabling the dance for the units by their addresses: setCanDance({"addr", ...}, canDance) */
    private static final Pattern SET_CAN_DANCE_PATTERN = Pattern.compile("setCanDance\\s*\\(\\s*\\{([^}]*)}");
    private static final Pattern QUOTED_STRING_PATTERN = Pattern.compile("\"([^\"]*)\"");

    @Override
    public <T> T readJson(String path, Class<T> clazz) {
        LOG.debug("Reading json file at path: {}", path);
        try {
            return new ObjectMapper().readValue(new File(path), clazz);
        } catch (IOException e) {
            throw new FileReadingException("Reading json file failed", e);
        }
    }

    @Override
    public JsonNode readJsonTree(String path) {
        LOG.debug("Reading json file at path: {}", path);
        try {
            return new ObjectMapper().readTree(new File(path));
        } catch (IOException e) {
            throw new FileReadingException("Reading json file failed", e);
        }
    }

    @Override
    public List<LocalizationFileModel> readLocalizations(String... folderPaths) {
        List<LocalizationFileModel> localizationFileModels = new ArrayList<>();
        for (String folderPath : folderPaths) {
            LOG.debug("Reading localization files at path: {}", folderPath);
            File folder = new File(folderPath);
            if (folder.isDirectory()) {
                File[] locFiles = folder.listFiles((dir, name) -> name.toLowerCase().endsWith(LOC_FILENAME_SUFFIX));
                if (locFiles != null) {
                    Arrays.stream(locFiles)
                            .map(this::readLocalization)
                            .forEach(localizationFileModels::add);
                }
            }
        }
        return localizationFileModels;
    }

    @Override
    public LocalizationFileModel readLocalization(File file) {
        LOG.debug("Reading localization file at path: {}", file.getPath());
        try (Scanner scanner = new Scanner(file, StandardCharsets.UTF_8)) {
            LocalizationFileModel localizationModel = new LocalizationFileModel();
            Map<String, List<String>> localizationValues = new HashMap<>();
            // trailing empty parts are kept: "<*upgrade66>Next country|" is a name with an empty description,
            // so its name must be the part 0 like the names of other researches
            scanner.findAll(LOC_VALUE_PATTERN)
                    .forEach(match -> localizationValues.put(match.group(1),
                            Arrays.asList(match.group(2).split(LOCALIZATION_MULTI_VALUE_DELIMITER_REGEX, -1))));
            localizationModel.setValues(localizationValues);
            localizationModel.setFilename(file.getName());
            return localizationModel;
        } catch (IOException e) {
            throw new FileReadingException("Reading localization file failed", e);
        }
    }

    @Override
    public SessionInitFileModel readSessionInitLua(String path) {
        LOG.debug("Reading session/init.lua file at path: {}", path);
        Map<String, Object> values = readLuaValues(path);
        SessionInitFileModel sessionInitModel = new SessionInitFileModel();
        sessionInitModel.setAgeNames(readLocalizationKeys(values, "ageNames", path));
        return sessionInitModel;
    }

    @Override
    public List<String> readDanceUnitsLua(String path) {
        LOG.debug("Reading session/_start.lua file at path: {}", path);
        try {
            byte[] bytes = Files.readAllBytes(Paths.get(path));
            if (Arrays.equals(bytes, 0, Math.min(bytes.length, LUA_BYTECODE_SIGNATURE.length),
                    LUA_BYTECODE_SIGNATURE, 0, LUA_BYTECODE_SIGNATURE.length)) {
                LOG.warn("Units that can dance are unknown: {} is compiled", path);
                return null;
            }
            List<String> result = new ArrayList<>();
            Matcher calls = SET_CAN_DANCE_PATTERN.matcher(new String(bytes, StandardCharsets.UTF_8));
            while (calls.find()) {
                Matcher addresses = QUOTED_STRING_PATTERN.matcher(calls.group(1));
                while (addresses.find()) {
                    result.add(addresses.group(1));
                }
            }
            if (result.isEmpty()) {
                LOG.warn("Units that can dance are unknown: no setCanDance calls in {}", path);
                return null;
            }
            return result;
        } catch (IOException e) {
            throw new FileReadingException("Reading LUA file failed", e);
        }
    }

    @Override
    public OnProjectLoadFileModel readOnProjectLoadLua(String path) {
        LOG.debug("Reading main/onProjectLoad.lua file at path: {}", path);
        Map<String, Object> values = readLuaValues(path);
        OnProjectLoadFileModel onProjectLoadFileModel = new OnProjectLoadFileModel();
        onProjectLoadFileModel.setEnvTagNames(readLocalizationKeys(values, "envTagNames", path));
        onProjectLoadFileModel.setEnvSearchTagNames(readLocalizationKeys(values, "envSearchTagNames", path));
        onProjectLoadFileModel.setUnitTagNames(readLocalizationKeys(values, "unitTagNames", path));
        onProjectLoadFileModel.setUnitSearchTagNames(readLocalizationKeys(values, "unitSearchTagNames", path));
        onProjectLoadFileModel.setResourceNames(readLocalizationKeys(values, "resourceNames", path));
        return onProjectLoadFileModel;
    }

    @Override
    public CulturesFileModel readCulturesLua(String path) {
        LOG.debug("Reading common/cultures.lua file at path: {}", path);
        Map<String, Object> values = readLuaValues(path);
        CulturesFileModel culturesFileModel = new CulturesFileModel();
        culturesFileModel.setNationNames(readNationNames(values, path));
        Map<String, Integer> unitNations = new LinkedHashMap<>();
        readTable(values, "nationsByAddress", path).getEntries().forEach((address, nation) -> {
            if (!(address instanceof String) || !(nation instanceof Long)) {
                throw malformed("nationsByAddress", path, "expected unit path -> nation id but got " + address + " -> " + nation);
            }
            unitNations.put((String) address, ((Long) nation).intValue());
        });
        culturesFileModel.setUnitNationsByAddress(unitNations);
        return culturesFileModel;
    }

    @Override
    public EnvNamesFileModel readEnvNamesLua(String path) {
        LOG.debug("Reading common/envNames.lua file at path: {}", path);
        Map<String, Object> values = readLuaValues(path);
        Map<String, String> envNameKeys = new LinkedHashMap<>();
        // the table of keys is local to localizedEnvNames(): a string is a shared localization key,
        // false means the env is named by its own key, anything else means no name
        readTable(values, "tags", path).getEntries().forEach((address, key) -> {
            if (!(address instanceof String)) {
                throw malformed("tags", path, "expected env path but got " + address);
            }
            if (key instanceof String) {
                envNameKeys.put((String) address, (String) key);
            } else if (Boolean.FALSE.equals(key)) {
                envNameKeys.put((String) address, null);
            }
        });
        EnvNamesFileModel envNamesFileModel = new EnvNamesFileModel();
        envNamesFileModel.setEnvNameKeys(envNameKeys);
        return envNamesFileModel;
    }

    @Override
    public ResearchIconsFileModel readResearchIconsLua(String path) {
        LOG.debug("Reading researchIcons.lua file at path: {}", path);
        Map<String, Object> values = readLuaValues(path);
        Map<Integer, String> researchIcons = new TreeMap<>();
        readTable(values, "assets", path).getIndexedEntries().forEach((researchId, asset) -> {
            if (!(asset instanceof String)) {
                throw malformed("assets", path, "expected image asset name but got " + asset);
            }
            researchIcons.put(researchId, (String) asset);
        });
        ResearchIconsFileModel researchIconsFileModel = new ResearchIconsFileModel();
        researchIconsFileModel.setResearchIcons(researchIcons);
        return researchIconsFileModel;
    }

    @Override
    public Map<String, Map<String, byte[]>> readPacks(String folderPath, String addressPrefix) {
        LOG.debug("Reading content packs at path: {}", folderPath);
        Path folder = Paths.get(folderPath);
        Map<String, Map<String, byte[]>> result = new TreeMap<>();
        try (Stream<Path> files = Files.walk(folder)) {
            List<Path> packs = files
                    .filter(Files::isRegularFile)
                    .filter(file -> file.getFileName().toString().endsWith(GemPackReader.PACK_FILE_EXTENSION))
                    .toList();
            for (Path pack : packs) {
                String relativePath = folder.relativize(pack).toString().replace(File.separatorChar, '/');
                String address = addressPrefix + SLASH
                        + relativePath.substring(0, relativePath.length() - GemPackReader.PACK_FILE_EXTENSION.length());
                try {
                    result.put(address, GemPackReader.read(Files.readAllBytes(pack)));
                } catch (IllegalArgumentException e) {
                    throw new FileReadingException("Malformed content pack: " + pack, e);
                }
            }
        } catch (IOException e) {
            throw new FileReadingException("Reading content packs failed", e);
        }
        LOG.debug("Read {} content packs at path: {}", result.size(), folderPath);
        return result;
    }

    /**
     * Reads the values a Lua chunk (either source or compiled) assigns to its named places, by name
     */
    private Map<String, Object> readLuaValues(String path) {
        try {
            byte[] bytes = Files.readAllBytes(Paths.get(path));
            if (Arrays.equals(bytes, 0, Math.min(bytes.length, LUA_BYTECODE_SIGNATURE.length),
                    LUA_BYTECODE_SIGNATURE, 0, LUA_BYTECODE_SIGNATURE.length)) {
                LuaPrototype main = LuaBytecodeReader.read(bytes);
                return LuaTableExtractor.extractNamedValues(main);
            }
            return LuaSourceReader.extractNamedValues(new String(bytes, StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new FileReadingException("Reading LUA file failed", e);
        } catch (IllegalArgumentException e) {
            throw new FileReadingException("Parsing LUA file failed: " + path, e);
        }
    }

    /**
     * Reads a table of {@code localize("<*key>")} calls as a list of localization keys
     */
    private List<String> readLocalizationKeys(Map<String, Object> values, String name, String path) {
        List<String> result = new ArrayList<>();
        readTable(values, name, path).getValues()
                .forEach(value -> result.add(getLocalizationKey(value, name, path)));
        return result;
    }

    /**
     * Reads a table of nations, each of them holding either a single localization key
     * or a key for each of the two periods
     */
    private List<List<String>> readNationNames(Map<String, Object> values, String path) {
        List<List<String>> result = new ArrayList<>();
        for (Object value : readTable(values, "nationNames", path).getValues()) {
            List<String> keys = new ArrayList<>();
            if (value instanceof LuaTable periods) {
                periods.getValues().forEach(period -> keys.add(getLocalizationKey(period, "nationNames", path)));
            } else {
                keys.add(getLocalizationKey(value, "nationNames", path));
            }
            result.add(keys);
        }
        return result;
    }

    private LuaTable readTable(Map<String, Object> values, String name, String path) {
        Object value = values.get(name);
        if (!(value instanceof LuaTable table)) {
            throw malformed(name, path, value == null ? "table is absent" : "value is not a table");
        }
        return table;
    }

    private String getLocalizationKey(Object value, String name, String path) {
        if (value instanceof LuaFunctionCall call
                && LOCALIZE_FUNCTION.equals(call.getFunctionName())
                && call.getArguments().size() == 1
                && call.getArguments().get(0) instanceof String key) {
            return toExporterLocalizationKey(key);
        }
        throw malformed(name, path, "expected a " + LOCALIZE_FUNCTION + " call but got " + value);
    }

    /**
     * Game scripts address a part of a multipart localization entry as "<*key/N>",
     * the exporter uses its own part delimiter (e.g. "<*nationName13/0>" -> "<*nationName13#0>")
     */
    private String toExporterLocalizationKey(String gameKey) {
        Matcher matcher = GAME_LOCALIZATION_PART_KEY_PATTERN.matcher(gameKey);
        return matcher.matches()
                ? Utils.getLocalizationPartKey(matcher.group(1) + CLOSING_ANGLE_BRACKET, Integer.parseInt(matcher.group(2)))
                : gameKey;
    }

    private FileReadingException malformed(String name, String path, String reason) {
        LOG.error("LUA file {} does not contain a valid [{}] table: {}", path, name, reason);
        return new FileReadingException("Malformed LUA file");
    }
}
