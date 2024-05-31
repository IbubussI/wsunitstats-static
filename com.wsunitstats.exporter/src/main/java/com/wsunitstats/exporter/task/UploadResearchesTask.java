package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.RestService;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class UploadResearchesTask extends RestUploadTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(UploadResearchesTask.class);
    private static final String TASK_NAME = "uploadResearches";

    @Autowired
    private ModelExporterService exporterService;
    @Autowired
    private RestService restService;

    @Value("${com.wsunitstats.exporter.upload.researches}")
    private String uploadUriPath;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            String authToken = getAuthToken(restService, payload);
            String json = exporterService.exportToJson(payload.getResearches());
            String endpoint = payload.getHostname() + uploadUriPath;
            LOG.info("Sending researches data to {}", endpoint);
            ResponseEntity<String> response = restService.postJson(endpoint, new HashMap<>(), json, authToken);
            LOG.info("Researches data submitted: HTTP {} : {}", response.getStatusCode().value(), response.getBody());
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }
}
