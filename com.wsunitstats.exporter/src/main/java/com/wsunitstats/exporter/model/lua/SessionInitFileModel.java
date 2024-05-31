package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class SessionInitFileModel {
    public static final List<String> ARRAY_NAMES = List.of(
            "ageNames"
    );
    private List<String> ageNames;

    public void setAll(List<List<String>> lists) {
        if (lists.size() == ARRAY_NAMES.size()) {
            ageNames = lists.get(0);
        }
    }
}
