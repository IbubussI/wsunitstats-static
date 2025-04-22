package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.option.NationOption;
import com.wsunitstats.exporter.model.exported.option.ResearchOption;
import com.wsunitstats.exporter.model.exported.option.ResearchTypeOption;
import com.wsunitstats.exporter.model.exported.option.TagOption;
import com.wsunitstats.exporter.model.exported.option.UnitOption;
import com.wsunitstats.exporter.model.exported.submodel.NationModel;
import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import com.wsunitstats.exporter.service.OptionsBuilder;
import com.wsunitstats.exporter.utils.Constants.ResearchType;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
public class OptionsBuilderImpl implements OptionsBuilder {
    public Collection<UnitOption> buildUnitOptions(List<UnitModel> unitModels) {
        return unitModels.stream().map(unit -> {
            UnitOption unitOption = new UnitOption();
            unitOption.setName(unit.getName());
            unitOption.setNation(unit.getNation().getName());
            unitOption.setGameId(unit.getGameId());
            unitOption.setImage(unit.getImage());
            unitOption.setNationId(unit.getNation().getNationId());
            unitOption.setSearchTags(unit.getSearchTags().stream().map(TagModel::getGameId).toList());
            unitOption.setUnitTags(unit.getTags().stream().map(TagModel::getGameId).toList());
            unitOption.setCategory(unit.getCategory());
            unitOption.setKillValue(unit.getKillValue());
            return unitOption;
        }).toList();
    }

    public Collection<ResearchOption> buildResearchOptions(List<ResearchModel> researchModels) {
        return researchModels.stream().map(research -> {
            ResearchOption researchOption = new ResearchOption();
            researchOption.setName(research.getName());
            researchOption.setDescription(research.getDescription());
            researchOption.setGameId(research.getGameId());
            researchOption.setImage(research.getImage());
            researchOption.setType(research.getType());
            return researchOption;
        }).toList();
    }

    public Collection<ResearchTypeOption> buildResearchTypeOptions() {
        return Arrays.stream(ResearchType.values()).map(researchType -> {
            ResearchTypeOption researchTypeOption = new ResearchTypeOption();
            researchTypeOption.setId(researchType.ordinal());
            researchTypeOption.setName(researchType.getType());
            return researchTypeOption;
        }).toList();
    }

    public Collection<String> buildLocaleOptions(List<LocalizationModel> localizationModels) {
        return localizationModels.stream().map(LocalizationModel::getLocale).toList();
    }

    public Collection<TagOption> buildUnitTagOptions(List<UnitModel> unitModels) {
        Set<TagOption> result = new TreeSet<>();
        unitModels.stream()
                .flatMap(unitModel -> unitModel.getTags().stream())
                .forEach(tag -> {
                    TagOption tagOption = new TagOption();
                    tagOption.setName(tag.getName());
                    tagOption.setGameId(tag.getGameId());
                    result.add(tagOption);
                });
        return result;
    }

    public Collection<TagOption> buildSearchTagOptions(List<UnitModel> unitModels) {
        Set<TagOption> result = new TreeSet<>();
        unitModels.stream()
                .flatMap(unitModel -> unitModel.getSearchTags().stream())
                .forEach(tag -> {
                    TagOption tagOption = new TagOption();
                    tagOption.setName(tag.getName());
                    tagOption.setGameId(tag.getGameId());
                    result.add(tagOption);
                });
        return result;
    }

    public Collection<NationOption> buildNationsOptions(List<UnitModel> unitModels) {
        Set<NationOption> result = new TreeSet<>();
        unitModels.forEach(unit -> {
            NationModel nationModel = unit.getNation();
            NationOption nationOption = new NationOption();
            nationOption.setName(nationModel.getName());
            nationOption.setGameId(nationModel.getNationId());
            result.add(nationOption);
        });
        return result;
    }
}
