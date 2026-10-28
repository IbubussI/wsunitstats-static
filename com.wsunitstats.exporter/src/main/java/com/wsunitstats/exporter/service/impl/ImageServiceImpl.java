package com.wsunitstats.exporter.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wsunitstats.exporter.content.Ktx2Reader;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.model.ImageSource;
import com.wsunitstats.exporter.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

@Service
public class ImageServiceImpl implements ImageService {
    private static final Logger LOG = LoggerFactory.getLogger(ImageServiceImpl.class);
    /** Separates the atlas from the image name in an interface image asset name */
    private static final String ASSET_IMAGE_DELIMITER = "#";
    /** Image name of an asset referencing a whole single-image atlas */
    private static final String DEFAULT_ASSET_IMAGE = "default";
    private static final String ATLAS_DESCRIPTOR_EXTENSION = ".json";
    private static final String PNG_EXTENSION = ".png";

    @Value("${image.file.extension}")
    private String imageExtension;

    @Override
    public Map<String, BufferedImage> resolveImages(Map<String, ImageSource> sources, String uiContentFolderPath) {
        Map<String, BufferedImage> result = new TreeMap<>();
        Map<String, Atlas> atlases = new HashMap<>();
        sources.forEach((name, source) -> {
            try {
                BufferedImage image = source.texture() != null
                        ? Ktx2Reader.read(source.texture())
                        : readAsset(source.asset(), uiContentFolderPath, atlases);
                result.put(name, image);
            } catch (IOException | RuntimeException e) {
                LOG.error("Cannot read image {} from {}: {}", name, source, e.getMessage());
            }
        });
        return result;
    }

    @Override
    public String getImageName(String type, EntityId id) {
        return type + "/" + id + "." + imageExtension;
    }

    @Override
    public String getImageName(String type, int index) {
        return type + "/" + index + "." + imageExtension;
    }

    private BufferedImage readAsset(String asset, String uiContentFolderPath, Map<String, Atlas> atlases) throws IOException {
        int delimiterIndex = asset.indexOf(ASSET_IMAGE_DELIMITER);
        String atlasName = delimiterIndex < 0 ? asset : asset.substring(0, delimiterIndex);
        String imageName = delimiterIndex < 0 ? DEFAULT_ASSET_IMAGE : asset.substring(delimiterIndex + 1);

        Atlas atlas = atlases.get(atlasName);
        if (atlas == null) {
            atlas = readAtlas(new File(uiContentFolderPath, atlasName).getPath());
            atlases.put(atlasName, atlas);
        }
        JsonNode region = atlas.descriptor().path("images").get(imageName);
        if (region == null) {
            throw new IllegalArgumentException("No image [" + imageName + "] in atlas " + atlasName);
        }
        return crop(atlas.texture(), region);
    }

    private Atlas readAtlas(String basePath) throws IOException {
        JsonNode descriptor = new ObjectMapper().readTree(new File(basePath + ATLAS_DESCRIPTOR_EXTENSION));
        File ktx2File = new File(basePath + Ktx2Reader.KTX2_FILE_EXTENSION);
        BufferedImage texture;
        if (ktx2File.exists()) {
            texture = Ktx2Reader.read(Files.readAllBytes(ktx2File.toPath()));
        } else {
            texture = ImageIO.read(new File(basePath + PNG_EXTENSION));
        }
        if (texture == null) {
            throw new IOException("No texture found for atlas " + basePath);
        }
        return new Atlas(descriptor, texture);
    }

    /**
     * Cuts the region out of the atlas texture. Region position and size are in texture coordinates:
     * fractions of the texture size, with the vertical axis pointing up from the bottom of the image
     * (so the whole texture is pos = [0, 1], size = [1, -1]).
     */
    private BufferedImage crop(BufferedImage texture, JsonNode region) {
        int width = texture.getWidth();
        int height = texture.getHeight();
        double u = region.path("pos").path(0).asDouble(0);
        double v = region.path("pos").path(1).asDouble(0);
        double sizeU = region.path("size").path(0).asDouble();
        double sizeV = region.path("size").path(1).asDouble();

        double left = Math.min(u, u + sizeU);
        double top = Math.max(v, v + sizeV);
        int x = (int) Math.round(left * width);
        int y = (int) Math.round((1 - top) * height);
        int w = (int) Math.round(Math.abs(sizeU) * width);
        int h = (int) Math.round(Math.abs(sizeV) * height);
        if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > width || y + h > height) {
            throw new IllegalArgumentException(String.format("Image region is out of texture bounds: texture %dx%d, region x=%d y=%d w=%d h=%d",
                    width, height, x, y, w, h));
        }
        return texture.getSubimage(x, y, w, h);
    }

    private record Atlas(JsonNode descriptor, BufferedImage texture) {
    }
}
