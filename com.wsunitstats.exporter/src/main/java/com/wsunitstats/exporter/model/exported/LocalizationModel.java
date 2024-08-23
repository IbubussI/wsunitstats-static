package com.wsunitstats.exporter.model.exported;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;

import java.util.Map;

@Getter
@Setter
@ToString
public class LocalizationModel {
    private String locale;
    private Map<String, String> entries;

    /**
     * Tries to find localized value
     *
     * @param key   key to find value for
     * @return localized value or the key if there are no values for such a key
     */
    public String getValue(String key) {
        String entry = entries.get(key);
        return entry != null ? entry : key;
    }
}
