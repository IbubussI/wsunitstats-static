package com.wsunitstats.exporter.model.exported;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public abstract class GenericEntityModel {
    protected int gameId;
    protected String name;
    protected String image;
}
