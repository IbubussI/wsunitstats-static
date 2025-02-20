package com.wsunitstats.exporter.model.exported.submodel;

import com.wsunitstats.exporter.model.NationName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class NationModel {
    private NationName name;
    private int nationId;
}
