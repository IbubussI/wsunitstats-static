package com.wsunitstats.exporter.content;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Files of the game content folder ({@code Cache/Content}), part of which is stored as assets in the mods storage.
 * <p>
 * {@code Content/asset-redirects.json} maps content paths to asset paths: {@code projectiles/WarSelection/bow.pack} →
 * {@code projectiles/asset-g8JS0oSUjSi_2/bow.pack}. The asset {@code g8JS0oSUjSi_2} (code and version) is described by
 * {@code modsStorage/manifests/g8JS0oSUjSi_2-<hash>.json}: {@code files} maps {@code projectiles/bow.pack} (the asset path
 * without the asset folder) to its sha256, the file is {@code modsStorage/blobs/<sha256>.pack} (whatever the file type).
 * Redirected files are absent from the content folder, or outdated there.
 */
public class ContentAssets {
    private static final Logger LOG = LoggerFactory.getLogger(ContentAssets.class);
    private static final String ASSET_FOLDER_PREFIX = "asset-";
    private static final String MANIFESTS_FOLDER = "manifests";
    private static final String BLOBS_FOLDER = "blobs";
    private static final String BLOB_EXTENSION = ".pack";
    /** Separates the asset id (code and version) from the hash in a manifest file name */
    private static final String MANIFEST_NAME_DELIMITER = "-";
    private static final String SLASH = "/";

    private final Path contentFolder;
    private final Path blobsFolder;
    /** content path → asset path */
    private final Map<String, String> redirects;
    /** asset id → file path in the asset (without the asset folder) → sha256 */
    private final Map<String, Map<String, String>> assetFiles;

    private ContentAssets(Path contentFolder, Path blobsFolder, Map<String, String> redirects,
                          Map<String, Map<String, String>> assetFiles) {
        this.contentFolder = contentFolder;
        this.blobsFolder = blobsFolder;
        this.redirects = redirects;
        this.assetFiles = assetFiles;
    }

    /**
     * @param redirectsFile     asset-redirects.json, may be absent (no assets)
     * @param modsStorageFolder folder of the asset manifests and blobs, may be absent (no assets)
     */
    public static ContentAssets read(Path contentFolder, Path redirectsFile, Path modsStorageFolder) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> redirects = new HashMap<>();
        if (Files.isRegularFile(redirectsFile)) {
            mapper.readTree(redirectsFile.toFile()).fields()
                    .forEachRemaining(entry -> redirects.put(entry.getKey(), entry.getValue().asText()));
        }

        Map<String, Map<String, String>> assetFiles = new HashMap<>();
        Path manifestsFolder = modsStorageFolder.resolve(MANIFESTS_FOLDER);
        if (Files.isDirectory(manifestsFolder)) {
            try (Stream<Path> manifests = Files.list(manifestsFolder)) {
                for (Path manifest : manifests.filter(Files::isRegularFile).toList()) {
                    String name = manifest.getFileName().toString();
                    int delimiter = name.lastIndexOf(MANIFEST_NAME_DELIMITER);
                    if (delimiter < 0) {
                        continue;
                    }
                    Map<String, String> files = new HashMap<>();
                    JsonNode tree = mapper.readTree(manifest.toFile());
                    tree.path("files").fields()
                            .forEachRemaining(entry -> files.put(entry.getKey(), entry.getValue().path("sha256").asText()));
                    assetFiles.put(name.substring(0, delimiter), files);
                }
            }
        }
        LOG.debug("Content assets: {} redirects, {} asset manifests", redirects.size(), assetFiles.size());
        return new ContentAssets(contentFolder, modsStorageFolder.resolve(BLOBS_FOLDER), redirects, assetFiles);
    }

    /**
     * @param contentPath path relative to the content folder, with forward slashes (e.g. units/WarSelection/2/e/archer.pack)
     * @return the file holding it: the asset blob if the path is redirected to an asset, else the file in the content folder
     * (it may not exist)
     */
    public Path resolve(String contentPath) {
        String target = redirects.get(contentPath);
        if (target == null) {
            return contentFolder.resolve(contentPath);
        }
        // <type>/asset-<id>/<path>
        String[] parts = target.split(SLASH, 3);
        if (parts.length < 3 || !parts[1].startsWith(ASSET_FOLDER_PREFIX)) {
            return contentFolder.resolve(target);
        }
        String assetId = parts[1].substring(ASSET_FOLDER_PREFIX.length());
        String sha256 = assetFiles.getOrDefault(assetId, Map.of()).get(parts[0] + SLASH + parts[2]);
        if (sha256 == null) {
            LOG.warn("Asset file of {} is unknown: no manifest entry for {}", contentPath, target);
            return contentFolder.resolve(contentPath);
        }
        return blobsFolder.resolve(sha256 + BLOB_EXTENSION);
    }

    /**
     * @param folderContentPath folder relative to the content folder (e.g. units/WarSelection)
     * @return content paths of the files under the folder (recursively) that are redirected to assets
     */
    public List<String> listRedirected(String folderContentPath, String extension) {
        String prefix = folderContentPath + SLASH;
        return redirects.keySet().stream()
                .filter(path -> path.startsWith(prefix) && path.endsWith(extension))
                .sorted()
                .toList();
    }

    /**
     * Data inside the assets refers to the redirected entities by their asset address:
     * {@code asset-mpdVn2uPPxd_2/horde/elves/king} for {@code WarSelection/horde/elves/king}
     *
     * @param folderContentPath content folder of a kind of entities (e.g. units/WarSelection)
     * @param addressPrefix     prefix of the entity paths in this folder (e.g. WarSelection)
     * @return asset address → entity path, for the packs of the folder redirected to assets
     */
    public Map<String, String> getAddressAliases(String folderContentPath, String addressPrefix) {
        Map<String, String> result = new LinkedHashMap<>();
        for (String contentPath : listRedirected(folderContentPath, BLOB_EXTENSION)) {
            // <type>/asset-<id>/<path>.pack
            String[] parts = redirects.get(contentPath).split(SLASH, 2);
            if (parts.length < 2 || !parts[1].startsWith(ASSET_FOLDER_PREFIX) || !parts[1].endsWith(BLOB_EXTENSION)) {
                continue;
            }
            String alias = parts[1].substring(0, parts[1].length() - BLOB_EXTENSION.length());
            String relativePath = contentPath.substring(folderContentPath.length() + SLASH.length(),
                    contentPath.length() - BLOB_EXTENSION.length());
            result.put(alias, addressPrefix + SLASH + relativePath);
        }
        return result;
    }

    public Path getContentFolder() {
        return contentFolder;
    }
}
