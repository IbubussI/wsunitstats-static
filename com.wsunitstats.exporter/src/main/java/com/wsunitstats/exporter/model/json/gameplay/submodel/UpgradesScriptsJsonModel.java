package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class UpgradesScriptsJsonModel {
    private List<UpgradeScriptJsonModel> list;
    private String path;
}
