package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.service.RestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class RestServiceImpl implements RestService {
    @Autowired
    private RestTemplate restTemplate;

    @Override
    public ResponseEntity<String> getAuthToken(String authEndpointUri, String username, String password) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, String> map= new LinkedMultiValueMap<>();
        map.add("username", username);
        map.add("password", password);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        return restTemplate.postForEntity(authEndpointUri, request, String.class);
    }

    @Override
    public ResponseEntity<String> postJson(String uri, Map<String, List<String>> parameters, String json, String authToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(Base64.getEncoder().encodeToString(authToken.getBytes(StandardCharsets.UTF_8)));
        String uriWithParams = UriComponentsBuilder.fromHttpUrl(uri)
                .queryParams(new LinkedMultiValueMap<>(parameters))
                .encode()
                .toUriString();
        HttpEntity<String> request = new HttpEntity<>(json, headers);
        return restTemplate.postForEntity(uriWithParams, request, String.class);
    }

    @Override
    public ResponseEntity<String> postFile(String uri, String filename, byte[] fileContent, String authToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(Base64.getEncoder().encodeToString(authToken.getBytes(StandardCharsets.UTF_8)));
        MultiValueMap<String, String> map= new LinkedMultiValueMap<>();
        map.add("file", Base64.getEncoder().encodeToString(fileContent));
        map.add("fileName", filename);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        return restTemplate.postForEntity(uri, request, String.class);
    }

    @Override
    public ResponseEntity<String> get(String uri, Map<String, List<String>> parameters) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        String uriWithParams = UriComponentsBuilder.fromHttpUrl(uri)
                .queryParams(new LinkedMultiValueMap<>(parameters))
                .encode()
                .toUriString();
        HttpEntity<String> request = new HttpEntity<>(headers);
        return restTemplate.exchange(uriWithParams, HttpMethod.GET, request, String.class);
    }
}