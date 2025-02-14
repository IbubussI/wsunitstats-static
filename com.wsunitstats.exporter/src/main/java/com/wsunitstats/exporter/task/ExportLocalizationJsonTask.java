package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExportLocalizationJsonTask extends BulkFileJsonExportTask<LocalizationModel> {
    private static final String TASK_NAME = "exportLocalization";

    @Autowired
    private ModelExporterService exporterService;

    @Value("${localization.path}")
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
    protected String getFilename(LocalizationModel researchModel) {
        return researchModel.getLocale();
    }

    @Override
    protected Iterable<LocalizationModel> getObjects(ExecutionPayload payload) {
        return payload.getLocalization();
    }

    @Override
    protected Object getExportedObject(LocalizationModel researchModel) {
        return researchModel.getEntries();
    }
}
