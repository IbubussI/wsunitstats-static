package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wsunitstats.exporter.exception.FileReadingException;
import com.wsunitstats.exporter.lua.LuaBytecodeReader;
import com.wsunitstats.exporter.lua.LuaFunctionCall;
import com.wsunitstats.exporter.lua.LuaPrototype;
import com.wsunitstats.exporter.lua.LuaTable;
import com.wsunitstats.exporter.lua.LuaTableExtractor;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;
import com.wsunitstats.exporter.service.FileReaderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Pattern;

import static com.wsunitstats.exporter.utils.Constants.LOCALIZATION_MULTI_VALUE_DELIMITER_REGEX;
import static com.wsunitstats.exporter.utils.Constants.NIL;

@Service
public class FileReaderServiceImpl implements FileReaderService {
    private static final Logger LOG = LoggerFactory.getLogger(FileReaderServiceImpl.class);

    private static final Pattern LOC_VALUE_PATTERN = Pattern.compile("^(<\\*[^<>]*>)(.*)$", Pattern.MULTILINE);
    private static final String LOC_FILENAME_SUFFIX = ".loc";
    /** Lua function wrapping every localization key in the game scripts */
    private static final String LOCALIZE_FUNCTION = "localize";

    @Override
    public <T> T readJson(String path, Class<T> clazz) {
        LOG.debug("Reading json file at path: {}", path);
        try (FileReader fileReader = new FileReader(path)) {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(fileReader, clazz);
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
            scanner.findAll(LOC_VALUE_PATTERN)
                    .forEach(match -> localizationValues.put(match.group(1),
                            Arrays.asList(match.group(2).split(LOCALIZATION_MULTI_VALUE_DELIMITER_REGEX))));
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
    public OnProjectLoadFileModel readOnProjectLoadLua(String path) {
        LOG.debug("Reading main/onProjectLoad.lua file at path: {}", path);
        Map<String, Object> values = readLuaValues(path);
        OnProjectLoadFileModel onProjectLoadFileModel = new OnProjectLoadFileModel();
        onProjectLoadFileModel.setEnvNames(readIndexedLocalizationKeys(values, "envNames", path));
        onProjectLoadFileModel.setEnvTagNames(readLocalizationKeys(values, "envTagNames", path));
        onProjectLoadFileModel.setEnvSearchTagNames(readLocalizationKeys(values, "envSearchTagNames", path));
        onProjectLoadFileModel.setUnitTagNames(readLocalizationKeys(values, "unitTagNames", path));
        onProjectLoadFileModel.setUnitSearchTagNames(readLocalizationKeys(values, "unitSearchTagNames", path));
        onProjectLoadFileModel.setResourceNames(readLocalizationKeys(values, "resourceNames", path));
        onProjectLoadFileModel.setProjectileNames(readStrings(values, "projectileNames", path));
        return onProjectLoadFileModel;
    }

    @Override
    public CulturesFileModel readCulturesLua(String path) {
        LOG.debug("Reading common/cultures.lua file at path: {}", path);
        Map<String, Object> values = readLuaValues(path);
        CulturesFileModel culturesFileModel = new CulturesFileModel();
        culturesFileModel.setNationNames(readNationNames(values, path));
        culturesFileModel.setUnitNations(readStrings(values, "unitNations", path));
        return culturesFileModel;
    }

    /**
     * Reads the values the compiled LUA chunk assigns to its named places, by name
     */
    private Map<String, Object> readLuaValues(String path) {
        try {
            byte[] bytes = Files.readAllBytes(Paths.get(path));
            LuaPrototype main = LuaBytecodeReader.read(bytes);
            return LuaTableExtractor.extractNamedValues(main);
        } catch (IOException e) {
            throw new FileReadingException("Reading LUA file failed", e);
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
     * Reads a table of explicitly indexed {@code localize("<*key>")} calls as localization keys by index
     */
    private Map<Integer, String> readIndexedLocalizationKeys(Map<String, Object> values, String name, String path) {
        Map<Integer, String> result = new LinkedHashMap<>();
        readTable(values, name, path).getIndexedEntries()
                .forEach((index, value) -> result.put(index, getLocalizationKey(value, name, path)));
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

    /**
     * Reads a table of plain values as strings, keeping the {@code nil} ones
     */
    private List<String> readStrings(Map<String, Object> values, String name, String path) {
        List<String> result = new ArrayList<>();
        for (Object value : readTable(values, name, path).getValues()) {
            if (value == null) {
                result.add(NIL);
            } else if (value == LuaTableExtractor.UNKNOWN) {
                throw malformed(name, path, "value cannot be resolved");
            } else {
                result.add(String.valueOf(value));
            }
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
            return key;
        }
        throw malformed(name, path, "expected a " + LOCALIZE_FUNCTION + " call but got " + value);
    }

    private FileReadingException malformed(String name, String path, String reason) {
        LOG.error("LUA file {} does not contain a valid [{}] table: {}", path, name, reason);
        return new FileReadingException("Malformed LUA file");
    }
}
