package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExportResearchesJsonTask extends BulkFileJsonExportTask<ResearchModel> {
    private static final String TASK_NAME = "exportResearches";

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
    protected String getFilename(ResearchModel researchModel) {
        return String.valueOf(researchModel.getGameId());
    }

    @Override
    protected Iterable<ResearchModel> getObjects(ExecutionPayload payload) {
        return payload.getResearches();
    }

    @Override
    protected Object getExportedObject(ResearchModel researchModel) {
        return researchModel;
    }
}
