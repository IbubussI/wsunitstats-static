package com.wsunitstats.exporter.model.lua;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;

@Getter
@Setter
@ToString
public class EnvNamesFileModel {
    /**
     * Env name localization key by env path. A null key means that the env is named by its own
     * localization ({@code envName{id}}) stored in the env content pack. Envs absent here have no name.
     */
    private Map<String, String> envNameKeys;
}
