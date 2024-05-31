package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.module.SimpleSerializers;
import com.wsunitstats.exporter.service.ModelExporterService;
import com.wsunitstats.exporter.service.serializer.DoubleSerializer;
import org.springframework.stereotype.Service;

import java.io.Serial;

@Service
public class ModelExporterServiceImpl implements ModelExporterService {
    @Override
    public <T> String exportToJson(T model) throws JsonProcessingException {
        return getExportMapper().writeValueAsString(model);
    }

    @Override
    public <T> String exportToPrettyJson(T model) throws JsonProcessingException {
        DefaultPrettyPrinter prettyWriter = new DefaultPrettyPrinter();
        DefaultPrettyPrinter.Indenter indenter = new DefaultIndenter("\t", DefaultIndenter.SYS_LF);
        prettyWriter.indentObjectsWith(indenter);
        prettyWriter.indentArraysWith(indenter);
        return getExportMapper().writer(prettyWriter).writeValueAsString(model);
    }

    public ObjectMapper getExportMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new ExporterModule());
        mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        return mapper;
    }

    public static class ExporterModule extends SimpleModule {
        @Serial
        private static final long serialVersionUID = -9105685985325373621L;

        public ExporterModule() {
            super("StandardExporterModule");
        }

        @Override
        public void setupModule(SetupContext context) {
            SimpleSerializers serializers = new SimpleSerializers();
            serializers.addSerializer(Double.class, new DoubleSerializer());
            context.addSerializers(serializers);
        }
    }
}
