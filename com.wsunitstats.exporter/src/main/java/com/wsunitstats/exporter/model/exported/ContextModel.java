package com.wsunitstats.exporter.model.exported;

import com.wsunitstats.exporter.model.exported.option.ResearchOption;
import com.wsunitstats.exporter.model.exported.option.UnitOption;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Collection;

/**
 * Contains objects that are immutable part of any page
 */
@Getter
@Setter
@ToString
public class ContextModel {
    private Collection<String> localeOptions;
    private Collection<ResearchOption> researches;
    private Collection<UnitOption> units;
}
