package com.wsunitstats.exporter.model.exported.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class IncomeModel {
    private Double period;
    private List<ResourceModel> value;
}
