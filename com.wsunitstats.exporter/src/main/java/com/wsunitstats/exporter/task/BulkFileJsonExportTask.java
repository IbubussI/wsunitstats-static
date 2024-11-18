package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.io.FileWriter;
import java.io.Writer;

import static com.wsunitstats.exporter.utils.Constants.JSON_EXTENSION;

public abstract class BulkFileJsonExportTask<T> implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(BulkFileJsonExportTask.class);

    @Autowired
    private ModelExporterService exporterService;

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            String path = getPath();
            LOG.info("Exporting bulk json files to {}", path);
            File dir = new File(path);
            if (dir.exists() || dir.mkdirs()) {
                for (T object : getObjects(payload)) {
                    String filename = getFilename(object);
                    LOG.info("Converting object {} to json...", filename);
                    String json = exporterService.exportToJson(getExportedObject(object));
                    File file = new File(path + "/" + filename + JSON_EXTENSION);
                    try (Writer fileWriter = new FileWriter(file)) {
                        fileWriter.write(json);
                        fileWriter.flush();
                    }
                }
            } else {
                throw new TaskExecutionException("Cannot create/access file directory: " + path);
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }

    protected abstract String getPath();
    protected abstract String getFilename(T object);
    protected abstract Iterable<T> getObjects(ExecutionPayload payload);
    protected abstract Object getExportedObject(T object);
}
