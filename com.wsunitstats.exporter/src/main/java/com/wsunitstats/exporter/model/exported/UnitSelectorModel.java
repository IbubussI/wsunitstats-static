package com.wsunitstats.exporter.model.exported;

import com.wsunitstats.exporter.model.exported.option.NationOption;
import com.wsunitstats.exporter.model.exported.option.TagOption;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Collection;

@Getter
@Setter
@ToString
public class UnitSelectorModel {
    private Collection<TagOption> unitTags;
    private Collection<TagOption> searchTags;
    private Collection<NationOption> nations;
}
