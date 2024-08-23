package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.UnitSelectorModel;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExportUnitSelectorJsonTask extends FileJsonExportTask<UnitSelectorModel> {
    private static final String TASK_NAME = "exportUnitSelector";

    @Autowired
    private ModelExporterService exporterService;

    @Value("${units.path}")
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
    protected FileExportPayloadEntry<UnitSelectorModel> getObject(ExecutionPayload payload) {
        return payload.getUnitSelector();
    }
}
