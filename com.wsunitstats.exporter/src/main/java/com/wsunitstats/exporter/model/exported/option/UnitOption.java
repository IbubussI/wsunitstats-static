package com.wsunitstats.exporter.model.exported.option;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.wsunitstats.exporter.model.NationName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class UnitOption {
    private NationName nation;
    private String name;
    private String image;
    private int gameId;

    // filters
    private int nationId;
    @JsonInclude //To include empty list in json
    private List<Integer> searchTags;
    @JsonInclude //To include empty list in json
    private List<Integer> unitTags;
}
