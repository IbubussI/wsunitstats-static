package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TransportingModel {
    private Integer ownSize;
    private Integer carrySize;
    private Boolean onlyInfantry;
}
