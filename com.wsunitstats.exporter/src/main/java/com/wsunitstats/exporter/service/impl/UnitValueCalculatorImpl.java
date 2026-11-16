package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityReferences;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import com.wsunitstats.exporter.model.exported.submodel.UnitSourceModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.UnitCategoryService;
import com.wsunitstats.exporter.service.UnitValueCalculator;

import com.wsunitstats.exporter.utils.Constants.AdvancedUnitCategory;
import com.wsunitstats.exporter.utils.Utils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UnitValueCalculatorImpl implements UnitValueCalculator {
    private static final int TC_COST = 4000;
    private static final int WONDER_COST = 5000;
    private static final Map<AdvancedUnitCategory, Integer> SCORE_CATEGORY_WEIGHTS = new HashMap<>();
    private static final Map<Integer, Integer> NATION_VALUES = new HashMap<>();
    /** Costs by unit reference, resolved by the unit provider */
    private static final Map<String, Integer> EXCEPTION_COST_UNITS = new HashMap<>();
    private static final double GLOBAL_SCALE = 1d / 180;
    private static final double HIGH_VALUE_REDUCTION_RATE = 1d / 16000;
    /** Cost value of a unit of cost 100 is 1: a K/D without losses (the number of kills) is in units of that cost */
    private static final double COST_VALUE_SCALE = 1d / 100;

    static {
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.TC, 11);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.WORKER, 10);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.SECONDARY_BUILDING, 1);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.HOUSE, 5);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.DEFENCE_BUILDING, 1);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.PRODUCTION_BUILDING, 2);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.LAND, 1);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.GAMEPLAY_BUILDING, 4);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.OTHER, 0);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.FLEET, 3);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.ECO_BUILDING, 5);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.WALL, 20);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.WONDER, 18);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.MINE, 4);
        SCORE_CATEGORY_WEIGHTS.put(AdvancedUnitCategory.AIR, 2);

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

        EXCEPTION_COST_UNITS.put("WarSelection/4/ps/immortal", 450); // immortal
        EXCEPTION_COST_UNITS.put("WarSelection/5/worker", 100); // ir worker
        EXCEPTION_COST_UNITS.put("WarSelection/2/a/worker1", 65); // asia worker
        EXCEPTION_COST_UNITS.put("WarSelection/3/e/fisher", 140); // eu fisher (mid-age)
        EXCEPTION_COST_UNITS.put("WarSelection/3/a/fisher", 180); // east-asia fisher
        EXCEPTION_COST_UNITS.put("WarSelection/5/tractor", 800); // tractor
        EXCEPTION_COST_UNITS.put("WarSelection/5/fisher", 250); // trawler
        EXCEPTION_COST_UNITS.put("WarSelection/4/chn/fisher", 180); // chinese fisher
    }

    @Autowired
    private UnitCategoryService unitCategoryService;
    @Autowired
    private FileContentService fileContentService;

    private Map<EntityId, Integer> exceptionCosts;

    @PostConstruct
    protected void postConstruct() {
        exceptionCosts = EntityReferences.resolveKeys(fileContentService.getUnits(), EXCEPTION_COST_UNITS);
    }

    @Override
    public double calcScoreValue(UnitModel unit) {
        AdvancedUnitCategory category = AdvancedUnitCategory.fromName(unit.getAdvancedCategory());
        double avgCost = calcUnitCostValue(unit);
        // cost with reduced high values (the less exp divider - the more reduce effect)
        double nCost = avgCost * Math.exp(-avgCost * HIGH_VALUE_REDUCTION_RATE);
        int categoryK = SCORE_CATEGORY_WEIGHTS.get(category);
        int nationK = NATION_VALUES.getOrDefault(unit.getNation().getNationId(), NATION_VALUES.get(-1));
        return nCost * (categoryK + nationK) * GLOBAL_SCALE;
    }

    /** Cost value / 100 ({@link #calcUnitCostValue}), the same for any category, age and nation; used for K/D */
    @Override
    public double calcCostValue(UnitModel unit) {
        return calcUnitCostValue(unit) * COST_VALUE_SCALE;
    }

    @Override
    public double calcUnitCostValue(UnitModel unit) {
        AdvancedUnitCategory category = AdvancedUnitCategory.fromName(unit.getAdvancedCategory());
        List<UnitSourceModel> unitSources = unit.getSources();
        double lowestAvg = Double.MAX_VALUE;
        for (UnitSourceModel source : unitSources) {
            if (source.getCost() == null) {
                // free sources (on death, by weapon) say nothing about the unit cost
                continue;
            }
            lowestAvg = Math.min(lowestAvg, getCostAvg(source));
        }
        if (category.equals(AdvancedUnitCategory.WONDER)) {
            return WONDER_COST;
        }
        if (category.equals(AdvancedUnitCategory.TC)) {
            return TC_COST;
        }
        Integer exceptionCost = exceptionCosts.get(unit.getGameId());
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
        return Utils.getCostValue(cost);
    }
}
