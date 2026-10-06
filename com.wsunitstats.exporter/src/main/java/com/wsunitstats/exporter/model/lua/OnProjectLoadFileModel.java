package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class OnProjectLoadFileModel {
    private List<String> envTagNames;
    private List<String> envSearchTagNames;
    private List<String> unitTagNames;
    private List<String> unitSearchTagNames;
    private List<String> resourceNames;
}
