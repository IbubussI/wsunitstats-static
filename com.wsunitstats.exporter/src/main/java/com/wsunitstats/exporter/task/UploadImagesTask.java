package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.RestService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Map;

@Component
public class UploadImagesTask extends RestUploadTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(UploadImagesTask.class);
    private static final String TASK_NAME = "uploadImages";

    @Autowired
    private RestService restService;

    @Value("${com.wsunitstats.exporter.upload.images}")
    private String imagesUriPath;
    @Value("${com.wsunitstats.exporter.image.file.extension}")
    private String imageExtension;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            String authToken = getAuthToken(restService, payload);
            String endpoint = payload.getHostname() + imagesUriPath;
            LOG.info("Sending images to {}", endpoint);
            for (Map.Entry<String, BufferedImage> entry : payload.getImages().entrySet()) {
                String filename = entry.getKey();
                ByteArrayOutputStream imageOutputStream = new ByteArrayOutputStream();
                ImageIO.write(entry.getValue(), imageExtension, imageOutputStream);
                ResponseEntity<String> imagesResponse = restService.postFile(endpoint, filename, imageOutputStream.toByteArray(), authToken);
                LOG.info("Image {} submitted: HTTP {} : {}", filename, imagesResponse.getStatusCode().value(), imagesResponse.getBody());
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }
}
