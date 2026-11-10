package com.wsunitstats.exporter.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FilePathWrapper {
    private String rootFolderPath;
    private String engineVersionFilePath;
    private String mainFilePath;
    private String gameplayFilePath;
    private String visualFilePath;
    private String localizationFolderPath;
    private String culturesFilePath;
    private String envNamesFilePath;
    private String onProjectLoadFilePath;
    private String sessionInitFilePath;
    private String sessionStartFilePath;
    /** group.json of the gameplay scripts (the upgrade scripts list, no longer in gameplay.json since engine 277) */
    private String gameplayScriptsGroupFilePath;
    private String researchIconsFilePath;
    private String contentFolderPath;
    /** may not exist */
    private String assetRedirectsFilePath;
    /** may not exist */
    private String modsStorageFolderPath;
    /** content folders of entity kinds, relative to the content folder (forward slashes) */
    private String unitsContentFolderPath;
    private String envsContentFolderPath;
    private String projectilesContentFolderPath;
    private String uiContentFolderPath;
}
