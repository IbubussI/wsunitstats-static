package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class OnProjectLoadFileModel {
    /** Env localization keys are indexed explicitly in the game files, by env id */
    private Map<Integer, String> envNames;
    private List<String> envTagNames;
    private List<String> envSearchTagNames;
    private List<String> unitTagNames;
    private List<String> unitSearchTagNames;
    private List<String> resourceNames;
    private List<String> projectileNames;
}
