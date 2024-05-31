package com.wsunitstats.exporter.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FilePathWrapper {
    private String rootFolderPath;
    private String gameplayFilePath;
    private String mainFilePath;
    private String visualFilePath;
    private String localizationFolderPath;
    private String mainStartupFilePath;
    private String sessionInitFilePath;
}
