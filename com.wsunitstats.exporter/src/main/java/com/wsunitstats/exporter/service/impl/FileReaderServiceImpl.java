package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wsunitstats.exporter.exception.FileReadingException;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.model.lua.CulturesFileModel;
import com.wsunitstats.exporter.model.lua.OnProjectLoadFileModel;
import com.wsunitstats.exporter.model.lua.SessionInitFileModel;
import com.wsunitstats.exporter.service.FileReaderService;
import org.apache.commons.lang3.StringUtils;
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
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.wsunitstats.exporter.utils.Constants.LOCALIZATION_MULTI_VALUE_DELIMITER_REGEX;

@Service
public class FileReaderServiceImpl implements FileReaderService {
    private static final Logger LOG = LoggerFactory.getLogger(FileReaderServiceImpl.class);

    private static final Pattern LOC_VALUE_PATTERN = Pattern.compile("^(<\\*[^<>]*>)(.*)$", Pattern.MULTILINE);
    private static final String LUA_ARRAY_REGEX = "%s\\s*=\\s*\\{";
    private static final String LUA_ARRAY_DELIMITER = "\\s*,\\s*";
    private static final Pattern LUA_COMMENTS_PATTERN = Pattern.compile("--[^\n\t\"]*$", Pattern.MULTILINE);
    private static final Pattern NEW_LINE_PATTERN = Pattern.compile("[\n\t\r]*", Pattern.MULTILINE);
    private static final String LOC_FILENAME_SUFFIX = ".loc";

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
        SessionInitFileModel sessionInitModel = new SessionInitFileModel();
        sessionInitModel.setAll(readLuaArrays(path, SessionInitFileModel.ARRAY_NAMES));
        return sessionInitModel;
    }

    @Override
    public OnProjectLoadFileModel readOnProjectLoadLua(String path) {
        LOG.debug("Reading main/onProjectLoad.lua file at path: {}", path);
        OnProjectLoadFileModel onProjectLoadFileModel = new OnProjectLoadFileModel();
        onProjectLoadFileModel.setAll(readLuaArrays(path, OnProjectLoadFileModel.ARRAY_NAMES));
        return onProjectLoadFileModel;
    }

    @Override
    public CulturesFileModel readCulturesLua(String path) {
        LOG.debug("Reading common/cultures.lua file at path: {}", path);
        CulturesFileModel culturesFileModel = new CulturesFileModel();
        culturesFileModel.setAll(readLuaArrays(path, CulturesFileModel.ARRAY_NAMES));
        return culturesFileModel;
    }

    private List<List<String>> readLuaArrays(String path, List<String> arrayNames) {
        try {
            List<List<String>> lists = new ArrayList<>();
            byte[] bytes = Files.readAllBytes(Paths.get(path));
            String fileContent = new String(bytes);

            arrayNames.forEach(arrayName -> {
                Pattern pattern = Pattern.compile(String.format(LUA_ARRAY_REGEX, arrayName), Pattern.DOTALL);
                Matcher matcher = pattern.matcher(fileContent);
                if (matcher.find()) {
                    int startArray = matcher.end();
                    int endArray = findClosingCurlyBrace(fileContent, startArray);
                    StringBuilder arrayBuilder = new StringBuilder(fileContent.substring(startArray, endArray));
                    arrayBuilder.replace(0, arrayBuilder.length(), LUA_COMMENTS_PATTERN.matcher(arrayBuilder).replaceAll(StringUtils.EMPTY));
                    arrayBuilder.replace(0, arrayBuilder.length(), NEW_LINE_PATTERN.matcher(arrayBuilder).replaceAll(StringUtils.EMPTY));
                    lists.add(Arrays.asList(arrayBuilder.toString().split(LUA_ARRAY_DELIMITER)));
                }
            });

            if (lists.size() != arrayNames.size()) {
                LOG.error("LUA file {} does not contain one of the next required arrays {}", path, arrayNames);
                throw new FileReadingException("Malformed LUA file");
            }
            return lists;
        } catch (IOException e) {
            throw new FileReadingException("Reading LUA file failed", e);
        }
    }

    private int findClosingCurlyBrace(String string, int startIndex) {
        int result = -1;
        int open = 0;
        int close = 0;
        for (int i = startIndex; i < string.length(); ++i) {
            char ch = string.charAt(i);
            if (ch == '}') {
                if (open == close) {
                    result = i;
                    break;
                }
                close++;
            } else if (ch == '{') {
                open++;
            }
        }
        return result;
    }
}
