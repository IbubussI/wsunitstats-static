package com.wsunitstats.exporter.model.json.main.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class TextureJsonModel {
    private Boolean mipmap;
    private String name;
    private Integer purpose;
    private Boolean repeat;
    private List<Integer> size;
    private Boolean smooth;
    private Integer source;
    private Integer target;
    private List<Object> urls;
    private Object wrapMode;
}
