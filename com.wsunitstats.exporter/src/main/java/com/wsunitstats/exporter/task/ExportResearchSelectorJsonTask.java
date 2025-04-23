package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.ResearchSelectorModel;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExportResearchSelectorJsonTask extends FileJsonExportTask<ResearchSelectorModel> {
    private static final String TASK_NAME = "exportResearchSelector";

    @Autowired
    private ModelExporterService exporterService;

    @Value("${researches.path}")
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
    protected FileExportPayloadEntry<ResearchSelectorModel> getObject(ExecutionPayload payload) {
        return payload.getResearchSelector();
    }
}
