package com.wsunitstats.exporter.model.exported.option;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ResourceOption {
    /** index in the game resource list */
    private int gameId;
    /** localization key */
    private String name;
    /** null if the resource has no exported icon */
    private String image;
}
