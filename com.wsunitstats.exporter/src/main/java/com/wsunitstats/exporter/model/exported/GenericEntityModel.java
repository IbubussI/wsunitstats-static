package com.wsunitstats.exporter.model.exported;

import com.wsunitstats.exporter.entity.EntityId;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public abstract class GenericEntityModel {
    protected EntityId gameId;
    protected String name;
    protected String image;
}
