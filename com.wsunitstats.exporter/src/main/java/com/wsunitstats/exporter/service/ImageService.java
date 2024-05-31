package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.model.json.main.MainFileJsonModel;

import java.awt.image.BufferedImage;
import java.util.Map;

public interface ImageService {
    Map<String, BufferedImage> resolveImages(MainFileJsonModel mainFileJsonModel, String rootFolderPath);

    String getImageName(String type, int id);
}
