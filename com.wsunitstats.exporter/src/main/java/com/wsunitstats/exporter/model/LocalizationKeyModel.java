package com.wsunitstats.exporter.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

/**
 * Allows to get localization key by game entity id (through list index).
 * Example: localizationKeyModel.getNationNames().get(nationId), which returns <*nationName...>
 */
@Getter
@Setter
@ToString
public class LocalizationKeyModel {
    private List<String> nationNames;
    private List<String> researchNames;
    private List<String> researchTexts;
    private List<String> unitNames;
    private List<String> unitTexts;
    private List<String> unitTagNames;
    private List<String> unitSearchTagNames;
    private Map<Integer, String> envNames;
    private List<String> envTagNames;
    private List<String> envSearchTagNames;
    private List<String> ageNames;
    private List<String> resourceNames;
}
