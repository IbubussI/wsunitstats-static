package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.ImageSource;

import java.awt.image.BufferedImage;
import java.util.Map;

public interface ImageService {
    /**
     * @param sources             image sources by image name
     * @param uiContentFolderPath folder the interface image assets are stored in
     * @return images by image name. Images which can't be read are logged and skipped.
     */
    Map<String, BufferedImage> resolveImages(Map<String, ImageSource> sources, String uiContentFolderPath);

    /**
     * @return name of the image of an entity: "<type>/<entity id>.<extension>"
     */
    String getImageName(String type, EntityId id);

    /**
     * @return name of the image of an item identified by a game list index (e.g. a resource): "<type>/<index>.<extension>"
     */
    String getImageName(String type, int index);
}
