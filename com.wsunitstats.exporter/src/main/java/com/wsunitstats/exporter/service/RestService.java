package com.wsunitstats.exporter.service;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface RestService {
    /**
     * Authenticates by given credentials and returns authentication token
     * @return {@link ResponseEntity} of executed request
     */
    ResponseEntity<String> getAuthToken(String authEndpointUri, String username, String password);

    /**
     * Send POST request with given JSON body to given URI
     * @return {@link ResponseEntity} of executed request
     */
    ResponseEntity<String> postJson(String uri, Map<String, List<String>> parameters, String json, String authToken);

    /**
     * Send POST request with given files body to given URI
     * @return {@link ResponseEntity} of executed request
     */
    ResponseEntity<String> postFile(String uri, String filename, byte[] file, String authToken);

    /**
     * Send GET request body to given URI
     * @return {@link ResponseEntity} of executed request
     */
    ResponseEntity<String> get(String uri, Map<String, List<String>> parameters);
}
