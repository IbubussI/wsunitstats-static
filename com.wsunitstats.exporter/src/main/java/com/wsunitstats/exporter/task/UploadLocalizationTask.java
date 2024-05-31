package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
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
import java.util.List;
import java.util.Map;

@Component
public class UploadLocalizationTask extends RestUploadTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(UploadLocalizationTask.class);
    private static final String TASK_NAME = "uploadLocalization";

    @Autowired
    private ModelExporterService exporterService;
    @Autowired
    private RestService restService;

    @Value("${com.wsunitstats.exporter.upload.localization}")
    private String uploadLocalizationUriPath;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            String authToken = getAuthToken(restService, payload);
            List<LocalizationModel> localizationModels = payload.getLocalization();
            String endpoint = payload.getHostname() + uploadLocalizationUriPath;
            Map<String, List<String>> parameters = new HashMap<>();
            parameters.put("forceResubmission", List.of("true"));
            LOG.info("Sending localization data to {}", endpoint);
            for (LocalizationModel localizationModel : localizationModels) {
                String locJson = exporterService.exportToJson(localizationModel);
                ResponseEntity<String> locResponse = restService.postJson(endpoint, parameters, locJson, authToken);
                LOG.info("Locale {} submitted: HTTP {} : {}", localizationModel.getLocale(), locResponse.getStatusCode().value(), locResponse.getBody());
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }
}
