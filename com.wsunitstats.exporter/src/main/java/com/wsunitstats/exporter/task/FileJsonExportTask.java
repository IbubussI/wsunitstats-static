package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.Writer;

import static com.wsunitstats.exporter.utils.Constants.JSON_EXTENSION;

@Component
public abstract class FileJsonExportTask<T> implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(FileJsonExportTask.class);

    @Autowired
    private ModelExporterService exporterService;

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            String path = getPath();
            LOG.info("Exporting option json files to {}", path);
            File dir = new File(path);
            if (dir.exists() || dir.mkdirs()) {
                FileExportPayloadEntry<T> entry = getObject(payload);
                String filename = entry.getFilename();
                LOG.info("Converting object {} to json...", filename);
                String json = exporterService.exportToJson(entry.getExportedObject());
                File file = new File(path + "/" + filename + JSON_EXTENSION);
                try (Writer fileWriter = new FileWriter(file)) {
                    fileWriter.write(json);
                    fileWriter.flush();
                }
            } else {
                throw new TaskExecutionException("Cannot create/access file directory: " + path);
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }

    protected abstract String getPath();
    protected abstract FileExportPayloadEntry<T> getObject(ExecutionPayload payload);
}
