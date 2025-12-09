package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class OnProjectLoadFileModel {
    public static final List<String> ARRAY_NAMES = List.of(
            "envNames",
            "envTagNames",
            "envSearchTagNames",
            "unitTagNames",
            "unitSearchTagNames",
            "resourceNames",
            "projectileNames"
    );

    private List<String> envNames;
    private List<String> envTagNames;
    private List<String> envSearchTagNames;
    private List<String> unitTagNames;
    private List<String> unitSearchTagNames;
    private List<String> resourceNames;
    private List<String> projectileNames;

    public void setAll(List<List<String>> lists) {
        if (lists.size() == ARRAY_NAMES.size()) {
            envNames = lists.get(0);
            envTagNames = lists.get(1);
            envSearchTagNames = lists.get(2);
            unitTagNames = lists.get(3);
            unitSearchTagNames = lists.get(4);
            resourceNames = lists.get(5);
            projectileNames = lists.get(6);
        } else {
            throw new IllegalStateException("List sizes don't match. They should be equal and in the same orders as arrays in the file");
        }
    }
}
