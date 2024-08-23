package com.wsunitstats.exporter.model.exported.submodel.research;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class UnitResearchModel {
    private String name;
    private String image;
    private int gameId;
    private List<UnitResearchUpgrade> upgrades = new ArrayList<>();

    public void addUpgrade(UnitResearchUpgrade upgrade) {
        upgrades.add(upgrade);
    }
}
