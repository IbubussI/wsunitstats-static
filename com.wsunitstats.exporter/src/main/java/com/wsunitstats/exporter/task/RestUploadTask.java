package com.wsunitstats.exporter.task;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wsunitstats.exporter.service.RestService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;

public abstract class RestUploadTask {
    private static final Logger LOG = LogManager.getLogger(RestUploadTask.class);

    protected String getAuthToken(RestService restService, ExecutionPayload payload) throws JsonProcessingException {
        LOG.info("Authorizing...");
        ResponseEntity<String> authTokenResponse = restService.getAuthToken(
                payload.getHostname() + payload.getAuthPath(),
                payload.getUsername(),
                payload.getPassword()
        );
        return parseToken(authTokenResponse.getBody());
    }

    private String parseToken(String authJsonResponse) throws JsonProcessingException {
        return new ObjectMapper()
                .readTree(authJsonResponse)
                .get("bearerToken")
                .asText();
    }
}
