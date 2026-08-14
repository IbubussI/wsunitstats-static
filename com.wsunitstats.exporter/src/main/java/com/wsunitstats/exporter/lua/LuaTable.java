package com.wsunitstats.exporter.lua;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Table reconstructed from a Lua table constructor. Keys are {@link Long} for the array part
 * and for explicit integer keys, and {@link String} for named fields.
 */
public class LuaTable {
    private final Map<Object, Object> entries = new LinkedHashMap<>();

    public void put(Object key, Object value) {
        entries.put(key, value);
    }

    public Map<Object, Object> getEntries() {
        return entries;
    }

    /**
     * Values of the integer-keyed entries, ordered by ascending key.
     * Lua arrays are 1-based, so the value of index 1 comes first.
     */
    public List<Object> getValues() {
        List<Map.Entry<Object, Object>> integerEntries = new ArrayList<>();
        for (Map.Entry<Object, Object> entry : entries.entrySet()) {
            if (entry.getKey() instanceof Long) {
                integerEntries.add(entry);
            }
        }
        integerEntries.sort(Comparator.comparingLong(entry -> (Long) entry.getKey()));
        List<Object> values = new ArrayList<>(integerEntries.size());
        integerEntries.forEach(entry -> values.add(entry.getValue()));
        return values;
    }

    /**
     * Integer-keyed entries as a map, preserving the keys used in the table constructor.
     */
    public Map<Integer, Object> getIndexedEntries() {
        Map<Integer, Object> result = new LinkedHashMap<>();
        for (Map.Entry<Object, Object> entry : entries.entrySet()) {
            if (entry.getKey() instanceof Long key) {
                result.put(key.intValue(), entry.getValue());
            }
        }
        return result;
    }

    @Override
    public String toString() {
        return "LuaTable" + entries;
    }
}
