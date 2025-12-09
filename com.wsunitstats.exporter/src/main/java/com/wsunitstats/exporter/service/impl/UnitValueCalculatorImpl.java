package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import com.wsunitstats.exporter.model.exported.submodel.UnitSourceModel;
import com.wsunitstats.exporter.service.UnitCategoryService;
import com.wsunitstats.exporter.service.UnitValueCalculator;

import com.wsunitstats.exporter.utils.Constants.AdvancedUnitCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UnitValueCalculatorImpl implements UnitValueCalculator {
    private static final int TC_COST = 4000;
    private static final int WONDER_COST = 5000;
    private static final Map<AdvancedUnitCategory, Integer> CATEGORY_VALUES = new HashMap<>();
    private static final Map<Integer, Integer> NATION_VALUES = new HashMap<>();
    private static final Map<Integer, Integer> EXCEPTION_COSTS = new HashMap<>();
    private static final double GLOBAL_SCALE = 1d / 180;
    private static final double HIGH_VALUE_REDUCTION_RATE = 1d / 16000;

    static {
        CATEGORY_VALUES.put(AdvancedUnitCategory.TC, 12);
        CATEGORY_VALUES.put(AdvancedUnitCategory.WORKER, 11);
        CATEGORY_VALUES.put(AdvancedUnitCategory.SECONDARY_BUILDING, 1);
        CATEGORY_VALUES.put(AdvancedUnitCategory.HOUSE, 5);
        CATEGORY_VALUES.put(AdvancedUnitCategory.DEFENCE_BUILDING, 1);
        CATEGORY_VALUES.put(AdvancedUnitCategory.PRODUCTION_BUILDING, 2);
        CATEGORY_VALUES.put(AdvancedUnitCategory.LAND, 1);
        CATEGORY_VALUES.put(AdvancedUnitCategory.GAMEPLAY_BUILDING, 4);
        CATEGORY_VALUES.put(AdvancedUnitCategory.OTHER, 0);
        CATEGORY_VALUES.put(AdvancedUnitCategory.FLEET, 3);
        CATEGORY_VALUES.put(AdvancedUnitCategory.ECO_BUILDING, 5);
        CATEGORY_VALUES.put(AdvancedUnitCategory.WALL, 20);
        CATEGORY_VALUES.put(AdvancedUnitCategory.WONDER, 18);
        CATEGORY_VALUES.put(AdvancedUnitCategory.MINE, 4);
        CATEGORY_VALUES.put(AdvancedUnitCategory.AIR, 2);

        NATION_VALUES.put(0, 1); // animals
        NATION_VALUES.put(1, 11); // stone
        NATION_VALUES.put(2, 6); // eu
        NATION_VALUES.put(3, 6); // as
        NATION_VALUES.put(4, 3); // west eu
        NATION_VALUES.put(5, 3); // east eu
        NATION_VALUES.put(6, 3); // west as
        NATION_VALUES.put(7, 3); // east as
        NATION_VALUES.put(20, 0); // other
        NATION_VALUES.put(-1, 1); // rest (any IR)

        EXCEPTION_COSTS.put(410, 450); // immortal
        EXCEPTION_COSTS.put(201, 100); // ir worker
        EXCEPTION_COSTS.put(31, 65); // asia worker
        EXCEPTION_COSTS.put(81, 140); // eu fisher (mid-age)
        EXCEPTION_COSTS.put(169, 180); // east-asia fisher
        EXCEPTION_COSTS.put(240, 800); // tractor
        EXCEPTION_COSTS.put(244, 250); // trawler
        EXCEPTION_COSTS.put(353, 180); // chinese fisher
    }

    @Autowired
    private UnitCategoryService unitCategoryService;

    @Override
    public double calcKillValue(UnitModel unit) {
        AdvancedUnitCategory category = AdvancedUnitCategory.fromName(unit.getAdvancedCategory());
        double avgCost = calcUnitCostValue(unit);
        // cost with reduced high values (the less exp divider - the more reduce effect)
        double nCost = avgCost * Math.exp(-avgCost * HIGH_VALUE_REDUCTION_RATE);
        int categoryK = CATEGORY_VALUES.get(category);
        int nationK = NATION_VALUES.getOrDefault(unit.getNation().getNationId(), NATION_VALUES.get(-1));
        return nCost * (categoryK + nationK) * GLOBAL_SCALE;
    }

    @Override
    public double calcUnitCostValue(UnitModel unit) {
        AdvancedUnitCategory category = AdvancedUnitCategory.fromName(unit.getAdvancedCategory());
        List<UnitSourceModel> unitSources = unit.getSources();
        double lowestAvg = Double.MAX_VALUE;
        for (UnitSourceModel source : unitSources) {
            lowestAvg = Math.min(lowestAvg, getCostAvg(source));
        }
        if (category.equals(AdvancedUnitCategory.WONDER)) {
            return WONDER_COST;
        }
        if (category.equals(AdvancedUnitCategory.TC)) {
            return TC_COST;
        }
        Integer exceptionCost = EXCEPTION_COSTS.get(unit.getGameId());
        if (exceptionCost != null) {
            return exceptionCost;
        }
        return lowestAvg == Double.MAX_VALUE || lowestAvg == 0 ? 1 : lowestAvg;
    }

    private double getCostAvg(UnitSourceModel source) {
        List<ResourceModel> cost = source.getFullChainCost();
        if (cost == null) {
            cost = source.getCost();
        }
        if (cost == null) {
            System.out.println(source);
        }
        // iron has bigger value due to lower mining speed
        return (cost.get(0).getValue() + cost.get(1).getValue() + cost.get(2).getValue() * 1.5);
    }
}
