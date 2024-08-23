package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.ContextModel;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExportContextJsonTask extends FileJsonExportTask<ContextModel> {
    private static final String TASK_NAME = "exportContext";

    @Autowired
    private ModelExporterService exporterService;

    @Value("${context.path}")
    private String path;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    protected String getPath() {
        return path;
    }

    @Override
    protected FileExportPayloadEntry<ContextModel> getObject(ExecutionPayload payload) {
        return payload.getContext();
    }
}
