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
    private String researchIconsFilePath;
    private String unitsContentFolderPath;
    private String envsContentFolderPath;
    private String projectilesContentFolderPath;
    private String uiContentFolderPath;
}
