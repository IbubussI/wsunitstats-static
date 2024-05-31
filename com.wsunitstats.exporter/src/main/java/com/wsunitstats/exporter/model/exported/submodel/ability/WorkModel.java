package com.wsunitstats.exporter.model.exported.submodel.ability;

import com.wsunitstats.exporter.model.exported.submodel.ReserveModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class WorkModel {
    private int workId;
    private boolean enabled;
    private Double makeTime;
    private List<ResourceModel> cost;
    private ReserveModel reserve;
}
