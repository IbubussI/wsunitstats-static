package com.wsunitstats.exporter.model.json.main.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class ImageJsonModel {
    private List<Double> pos;
    private List<Double> size;
    private Integer texture;
}
