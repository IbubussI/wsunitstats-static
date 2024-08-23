package com.wsunitstats.exporter.model.exported.option;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ResearchOption {
    private String description;
    private String name;
    private String image;
    private int gameId;
}
