package com.wsunitstats.exporter.model.exported.submodel.research;

import com.wsunitstats.exporter.model.exported.EntityInfoModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class UpgradeModel {
    private int upgradeId;
    private List<String> parameters;
    private int programId;
    private String programFile;
    private EntityInfoModel unit;
}
