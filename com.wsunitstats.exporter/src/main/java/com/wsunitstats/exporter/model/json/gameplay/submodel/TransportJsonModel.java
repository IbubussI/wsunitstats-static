package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TransportJsonModel {
    private Integer tags;
    private Integer unitLimit;
    private Integer volume;
}
