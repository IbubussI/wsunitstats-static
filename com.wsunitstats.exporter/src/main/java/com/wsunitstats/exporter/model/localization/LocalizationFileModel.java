package com.wsunitstats.exporter.model.localization;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class LocalizationFileModel {
    private String filename;
    private Map<String, List<String>> values;
}
