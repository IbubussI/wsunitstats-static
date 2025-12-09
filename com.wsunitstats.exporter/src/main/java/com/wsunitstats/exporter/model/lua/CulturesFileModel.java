package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class CulturesFileModel {
    public static final List<String> ARRAY_NAMES = List.of(
            "nationNames",
            "unitNations"
    );

    private List<String> nationNames;
    private List<String> unitNations;

    public void setAll(List<List<String>> lists) {
        if (lists.size() == ARRAY_NAMES.size()) {
            nationNames = lists.get(0);
            unitNations = lists.get(1);
        } else {
            throw new IllegalStateException("List sizes don't match. They should be equal and in the same orders as arrays in the file");
        }
    }
}
