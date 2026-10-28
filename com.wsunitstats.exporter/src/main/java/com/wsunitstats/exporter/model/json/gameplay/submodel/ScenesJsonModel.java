package com.wsunitstats.exporter.model.json.gameplay.submodel;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

/**
 * Units, envs and projectiles themselves are stored in the content packs.
 * Unit overrides are applied to the content packs while reading them.
 */
@Getter
@Setter
@ToString
public class ScenesJsonModel {
    private List<Object> layers;
    private Integer pathFindTime;
    private Map<String, Object> unitOverrides;
}
