package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExportUnitsJsonTask extends BulkFileJsonExportTask<UnitModel> {
    private static final String TASK_NAME = "exportUnits";

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
    protected String getFilename(UnitModel unitModel) {
        return String.valueOf(unitModel.getGameId());
    }

    @Override
    protected Iterable<UnitModel> getObjects(ExecutionPayload payload) {
        return payload.getUnits();
    }

    @Override
    protected Object getExportedObject(UnitModel unitModel) {
        return unitModel;
    }
}
