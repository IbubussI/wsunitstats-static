package com.wsunitstats.exporter.model;

import com.wsunitstats.exporter.entity.EntityId;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

/**
 * Allows to get localization key by game entity id.
 * Example: localizationKeyModel.getUnitNames().get(unitId), which returns <*unitName...>
 */
@Getter
@Setter
@ToString
public class LocalizationKeyModel {
    private List<NationName> nationNames;
    private Map<EntityId, String> researchNames;
    private Map<EntityId, String> researchTexts;
    private Map<EntityId, String> unitNames;
    private Map<EntityId, String> unitTexts;
    private List<String> unitTagNames;
    private List<String> unitSearchTagNames;
    private Map<EntityId, String> envNames;
    private List<String> envTagNames;
    private List<String> envSearchTagNames;
    private List<String> ageNames;
    private List<String> resourceNames;
}
