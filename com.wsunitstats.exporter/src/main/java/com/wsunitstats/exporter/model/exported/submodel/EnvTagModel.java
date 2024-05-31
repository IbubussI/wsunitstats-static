package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class EnvTagModel {
    private String envName;
    private String envImage;
    private int envId;
}
