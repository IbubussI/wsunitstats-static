package com.wsunitstats.exporter.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AbilityEntityInfoWrapper {
    private Integer entityId;
    private String entityType;
    private Integer createEnvId;
}
