package com.wsunitstats.exporter.service.impl;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Used to filter out localization keys that are not required
 */
@AllArgsConstructor
@Getter
public class LocalizationKeyFilter {
    private String keyName;

    public boolean matches(String key) {
        return key.startsWith("<*" + keyName);
    }
}
