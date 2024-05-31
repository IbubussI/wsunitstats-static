package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class MainStartupFileModel {
    public static final List<String> ARRAY_NAMES = List.of(
            "unitGroupsNames",
            "unitNames",
            "unitGroups",
            "envNames",
            "envTagNames",
            "envSearchTagNames",
            "unitTagNames",
            "unitSearchTagNames",
            "resourceNames",
            "projectileNames"
            //"passabilityLevels",
            //"particleNames",
            //"emitterNames",
            //"emittersGroupsNames",
            //"emitterAttackNames",
            //"upgradeScriptNames",
            //"upgradeScriptParameters",
    );

    private List<String> unitGroupsNames;
    private List<String> unitNames;
    private List<String> unitGroups;
    private List<String> envNames;
    private List<String> envTagNames;
    private List<String> envSearchTagNames;
    private List<String> unitTagNames;
    private List<String> unitSearchTagNames;
    private List<String> resourceNames;
    private List<String> projectileNames;
    private List<String> passabilityLevels;
    private List<String> particleNames;
    private List<String> emitterNames;
    private List<String> emittersGroupsNames;
    private List<String> emitterAttackNames;
    private List<String> upgradeScriptNames;
    private List<String> upgradeScriptParameters;

    public void setAll(List<List<String>> lists) {
        if (lists.size() == ARRAY_NAMES.size()) {
            unitGroupsNames = lists.get(0);
            unitNames = lists.get(1);
            unitGroups = lists.get(2);
            envNames = lists.get(3);
            envTagNames = lists.get(4);
            envSearchTagNames = lists.get(5);
            unitTagNames = lists.get(6);
            unitSearchTagNames = lists.get(7);
            resourceNames = lists.get(8);
            projectileNames = lists.get(9);
        } else {
            throw new IllegalStateException("List sizes don't match. They should be equal and in the same orders as arrays in the file");
        }
    }
}
