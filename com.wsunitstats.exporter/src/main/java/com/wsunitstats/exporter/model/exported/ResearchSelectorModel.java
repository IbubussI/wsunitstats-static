package com.wsunitstats.exporter.model.exported;

import com.wsunitstats.exporter.model.exported.option.ResearchTypeOption;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Collection;

@Getter
@Setter
@ToString
public class ResearchSelectorModel {
    private Collection<ResearchTypeOption> researchTypes;
}
