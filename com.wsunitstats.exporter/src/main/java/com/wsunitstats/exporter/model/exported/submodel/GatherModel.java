package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class GatherModel {
    private int gatherId;
    private Double angle;
    private Double bagSize;
    private Double findTargetDistance;
    private Double findStorageDistance;
    private Double gatherDistance;
    private Double putDistance;
    private Double perSecond;
    private List<EnvTagModel> envTags;
    private List<TagModel> storageTags;

    private List<TagModel> unitTags;
    private ResourceModel resource;
}
