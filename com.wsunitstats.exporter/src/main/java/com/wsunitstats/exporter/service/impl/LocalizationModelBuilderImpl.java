package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.localization.LocalizationFileModel;
import com.wsunitstats.exporter.service.LocalizationModelBuilder;
import com.wsunitstats.exporter.utils.Utils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.wsunitstats.exporter.utils.Constants.CLOSING_ANGLE_BRACKET;
import static com.wsunitstats.exporter.utils.Constants.LOCALIZATION_INDEX_DELIMITER;

@Service
public class LocalizationModelBuilderImpl implements LocalizationModelBuilder {
    private static final Pattern LOC_FILENAME_PATTERN = Pattern.compile("(.+)\\.loc");

    @Value("${localization.key.names}")
    private List<String> keyNames;

    @Override
    public LocalizationModel buildFromFileModel(LocalizationFileModel localizationFileModel) {
        LocalizationModel localizationModel = new LocalizationModel();
        localizationModel.setLocale(getLocaleFromFilename(localizationFileModel.getFilename()));
        Map<String, String> entryMap = new HashMap<>();
        for (Map.Entry<String, List<String>> mapEntry : localizationFileModel.getValues().entrySet()) {
            List<String> list = mapEntry.getValue();
            String key = mapEntry.getKey();
            if (filter(key)) {
                int listSize = list.size();
                for (int i = 0; i < listSize; ++i) {
                    StringBuilder keyBuilder = new StringBuilder(key);
                    if (listSize > 1) {
                        keyBuilder.insert(keyBuilder.indexOf(CLOSING_ANGLE_BRACKET), LOCALIZATION_INDEX_DELIMITER + i);
                    }
                    entryMap.put(keyBuilder.toString(), Utils.clearCurlyBraces(list.get(i)));
                }
            }
        }
        localizationModel.setEntries(entryMap);
        return localizationModel;
    }

    private String getLocaleFromFilename(String filename) {
        Matcher matcher = LOC_FILENAME_PATTERN.matcher(filename);
        if (matcher.find()) {
            return matcher.group(1);
        } else {
            throw new IllegalArgumentException("Localization filename is not valid: " + filename);
        }
    }

    private boolean filter(String key) {
        return keyNames.stream()
                .map(LocalizationKeyFilter::new)
                .anyMatch(filter -> filter.matches(key));
    }
}
