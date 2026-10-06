package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class UpgradesScriptsJsonModel {
    /** Script files by program id, relative to the upgrade scripts folder */
    private List<String> list;
    private String path;
}
