package com.wsunitstats.exporter.model.exported;

import com.wsunitstats.exporter.model.exported.submodel.research.ResearchSourceModel;
import com.wsunitstats.exporter.model.exported.submodel.research.UpgradeModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class ResearchModel extends GenericEntityModel {
    private String description;
    private List<UpgradeModel> upgrades;
    private String type;
    /**
     * units that research it, absent for researches applied otherwise (e.g. buffs)
     */
    private List<ResearchSourceModel> sources;
}
