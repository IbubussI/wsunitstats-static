package com.wsunitstats.exporter.model.exported.submodel.research;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class UpgradeModel {
    private int upgradeId;
    private Map<String, String> parameters;
    private int programId;
    private String programFile;
    private EntityInfoModel unit;
}
