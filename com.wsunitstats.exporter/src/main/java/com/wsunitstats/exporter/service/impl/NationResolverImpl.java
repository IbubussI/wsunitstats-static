package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.NationName;
import com.wsunitstats.exporter.model.exported.submodel.NationModel;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.NationResolver;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class NationResolverImpl implements NationResolver {
    @Autowired
    private FileContentService fileContentService;

    private List<NationModel> nations;
    private Map<EntityId, Integer> unitNations;

    @PostConstruct
    protected void postConstruct() {
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();
        List<NationName> nationNames = localizationKeyModel.getNationNames();

        unitNations = fileContentService.getUnitNations();
        nations = new ArrayList<>();

        for (int i = 0; i < nationNames.size(); i++) {
            NationName nationName = nationNames.get(i);
            NationModel nation = new NationModel();
            nation.setName(nationName);
            nation.setNationId(i);
            nations.add(nation);
        }

        // add "absent" nation in the end
        NationModel nation = new NationModel();
        NationName absentName = new NationName();
        absentName.setIr1("nationNameUnknown");
        nation.setName(absentName);
        nations.add(nation);
    }

    @Override
    public NationModel getUnitNation(EntityId unitId) {
        Integer nationId = unitNations.get(unitId);
        // if unit has no nation - get 'unknown' nation from the end
        return nationId == null ? nations.get(nations.size() - 1) : nations.get(nationId);
    }
}
