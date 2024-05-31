package com.wsunitstats.exporter.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public interface ModelExporterService {
    /**
     * Exports given model to json representation
     *
     * @param model model to be exported to json
     * @return json string
     */
    <T> String exportToJson(T model) throws JsonProcessingException;

    /**
     * Exports given model to readable json representation
     *
     * @param model model to be exported to json
     * @return readable json string
     */
    <T> String exportToPrettyJson(T model) throws JsonProcessingException;
}
