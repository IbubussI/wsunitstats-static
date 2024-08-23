package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.Map;

@Component
public class ExportImagesTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(ExportImagesTask.class);
    private static final String TASK_NAME = "exportImages";

    @Autowired
    private ModelExporterService exporterService;

    @Value("${image.path}")
    private String path;
    @Value("${image.file.extension}")
    private String imageExtension;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            LOG.info("Exporting images to {}", path);
            File dir = new File(path);
            if (dir.exists() || dir.mkdirs()) {
                for (Map.Entry<String, BufferedImage> entry : payload.getImages().entrySet()) {
                    String filename = entry.getKey();
                    File file = new File(path + "/" + filename);
                    LOG.info("Writing image {} to file...", filename);
                    ImageIO.write(entry.getValue(), imageExtension, file);
                }
            } else {
                throw new TaskExecutionException("Cannot create/access file directory: " + path);
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }
}
