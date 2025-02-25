package com.wsunitstats.exporter.model.exported.submodel.weapon;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ExternalDataModel {
    private GroundAttack groundAttack;
    private Object work;
    private Object disableMindButton;

    @Getter
    @Setter
    public static class GroundAttack {
        private Integer weapon;
        private List<List<Integer>> turrets;
    }
}
