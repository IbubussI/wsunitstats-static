package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.model.exported.submodel.TagModel;
import com.wsunitstats.exporter.model.LocalizationKeyModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.TagResolver;
import com.wsunitstats.exporter.utils.Constants;
import com.wsunitstats.exporter.utils.Constants.TagGroupName;
import com.wsunitstats.exporter.utils.Utils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.IntFunction;

@Service
public class TagResolverImpl implements TagResolver {
    // single 8 byte long is used to represent tags as a bit-set
    private static final int MAX_TAGS = 64;

    @Autowired
    private FileContentService fileContentService;

    private Map<Integer, TagModel> unitTags;
    private Map<Integer, TagModel> unitSearchTags;
    private Map<Integer, TagModel> envSearchTags;

    @PostConstruct
    protected void postConstruct() {
        LocalizationKeyModel localizationKeyModel = fileContentService.getLocalizationKeyModel();
        List<String> unitTagNames = localizationKeyModel.getUnitTagNames();
        List<String> unitSearchTagNames = localizationKeyModel.getUnitSearchTagNames();
        List<String> envSearchTagNames = localizationKeyModel.getEnvSearchTagNames();

        unitTags = generateTagsMap(TagGroupName.UNIT_TAGS,
                i -> i == 0 ? Constants.GENERIC_UNIT_TAG : i < unitTagNames.size() ? unitTagNames.get(i) : "null");
        unitSearchTags = generateTagsMap(TagGroupName.UNIT_SEARCH_TAGS,
                i -> i < unitSearchTagNames.size() ? unitSearchTagNames.get(i) : "null");
        envSearchTags = generateTagsMap(TagGroupName.ENV_SEARCH_TAGS,
                i -> i < envSearchTagNames.size() ? envSearchTagNames.get(i) : "null");
    }

    @Override
    public List<TagModel> getUnitTags(Long tags) {
        return getTags(unitTags, tags);
    }

    @Override
    public List<TagModel> getUnitSearchTags(Long tags) {
        return getTags(unitSearchTags, tags);
    }

    @Override
    public List<TagModel> getEnvSearchTags(Long tags) {
        return getTags(envSearchTags, tags);
    }

    private List<TagModel> getTags(Map<Integer, TagModel> source, Long tags) {
        List<TagModel> tagValues = new ArrayList<>();
        if (tags != null) {
            List<Integer> tagIds = Utils.getPositiveBitIndices(tags);
            for (int tagId : tagIds) {
                tagValues.add(source.get(tagId));
            }
        }
        return tagValues;
    }

    private Map<Integer, TagModel> generateTagsMap(TagGroupName groupName, IntFunction<String> nameGetter) {
        Map<Integer, TagModel> tagValues = new HashMap<>();
        for (int i = 0; i < MAX_TAGS; i++) {
            TagModel tag = new TagModel();
            tag.setName(nameGetter.apply(i));
            tag.setGameId(i);
            tag.setGroupName(groupName.getGroupName());
            tagValues.put(i, tag);
        }
        return tagValues;
    }
}
