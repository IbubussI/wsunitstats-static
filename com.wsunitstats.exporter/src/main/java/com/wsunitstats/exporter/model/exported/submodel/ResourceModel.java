package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ResourceModel {
    private int resourceId;
    private String resourceName;
    private Integer value;
    private String image;
}
