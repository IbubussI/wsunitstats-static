package com.wsunitstats.exporter.service.impl;

import com.wsunitstats.exporter.exception.GameFilesResolvingException;
import com.wsunitstats.exporter.jvdf.VDFNode;
import com.wsunitstats.exporter.jvdf.VDFParser;
import com.wsunitstats.exporter.model.FilePathWrapper;
import com.wsunitstats.exporter.service.FilePathResolver;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.Map;

@Service
@PropertySource(value = "classpath:exporter.properties")
@PropertySource(value = "file:config/exporter.properties", ignoreResourceNotFound = true)
public class FilePathResolverImpl implements FilePathResolver {
    private static final Logger LOG = LogManager.getLogger(FilePathResolverImpl.class);

    private static final String REG_QUERY = "reg query";
    private static final String REG_VALUE = "/v";
    private static final String REG_SZ = "REG_SZ";
    private static final String AUTODETECT = "autodetect";
    private static final String PATH = "path";
    private static final String APPS = "apps";
    private static final String LIBRARY_FOLDERS = "libraryfolders";

    @Value("${warselection.dir}")
    private String gameDirGiven;
    @Value("${reg.steam.key.64}")
    private String steam64RegKey;
    @Value("${reg.steam.key.32}")
    private String steam32RegKey;
    @Value("${reg.steam.install.path}")
    private String steamInstallPath;
    @Value("${steam.libraryfolders.file}")
    private String steamLibraryFoldersFile;
    @Value("${warselection.path}")
    private String steamWSPath;
    @Value("${warselection.app.id}")
    private String steamWSAppId;
    @Value("${warselection.root.folder}")
    private String wsRootFolderPath;
    @Value("${warselection.gameplay.file}")
    private String wsGameplayFilePath;
    @Value("${warselection.visual.file}")
    private String wsVisualFilePath;
    @Value("${warselection.localization.folder}")
    private String wsLocalizationFolderPath;
    @Value("${warselection.interfaces.session.init.file}")
    private String wsInterfacesSessionInitFilePath;
    @Value("${warselection.on.project.load.file}")
    private String wsOnProjectLoadFilePath;
    @Value("${warselection.cultures.file}")
    private String wsCulturesFilePath;
    @Value("${warselection.env.names.file}")
    private String wsEnvNamesFilePath;
    @Value("${warselection.research.icons.file}")
    private String wsResearchIconsFilePath;
    @Value("${warselection.content.units.folder}")
    private String wsUnitsContentFolderPath;
    @Value("${warselection.content.envs.folder}")
    private String wsEnvsContentFolderPath;
    @Value("${warselection.content.projectiles.folder}")
    private String wsProjectilesContentFolderPath;
    @Value("${warselection.content.ui.folder}")
    private String wsUiContentFolderPath;

    @Override
    public FilePathWrapper resolve() throws GameFilesResolvingException {
        LOG.debug("Resolving paths of game files");
        LOG.debug("Given WS root directory: {}", gameDirGiven);

        String gameDirPath;
        if (gameDirGiven == null || AUTODETECT.equals(gameDirGiven)) {
            String steamDir = resolveSteamDir();
            LOG.debug("Resolved steam root directory: {}", steamDir);
            gameDirPath = resolveGamePath(steamDir);
        } else {
            gameDirPath = gameDirGiven;
        }
        LOG.debug("Resolved WS root directory: {}", gameDirPath);

        FilePathWrapper result = new FilePathWrapper();
        String wsRootAbsFolderPath = gameDirPath + wsRootFolderPath;
        validateFile(wsRootAbsFolderPath);
        result.setRootFolderPath(wsRootAbsFolderPath);

        result.setGameplayFilePath(resolveRequired(wsRootAbsFolderPath, wsGameplayFilePath));
        result.setVisualFilePath(resolveRequired(wsRootAbsFolderPath, wsVisualFilePath));
        result.setLocalizationFolderPath(resolveRequired(wsRootAbsFolderPath, wsLocalizationFolderPath));
        result.setSessionInitFilePath(resolveRequired(wsRootAbsFolderPath, wsInterfacesSessionInitFilePath));
        result.setOnProjectLoadFilePath(resolveRequired(wsRootAbsFolderPath, wsOnProjectLoadFilePath));
        result.setCulturesFilePath(resolveRequired(wsRootAbsFolderPath, wsCulturesFilePath));
        result.setEnvNamesFilePath(resolveRequired(wsRootAbsFolderPath, wsEnvNamesFilePath));
        result.setResearchIconsFilePath(resolveRequired(wsRootAbsFolderPath, wsResearchIconsFilePath));
        result.setUnitsContentFolderPath(resolveRequired(wsRootAbsFolderPath, wsUnitsContentFolderPath));
        result.setEnvsContentFolderPath(resolveRequired(wsRootAbsFolderPath, wsEnvsContentFolderPath));
        result.setProjectilesContentFolderPath(resolveRequired(wsRootAbsFolderPath, wsProjectilesContentFolderPath));
        result.setUiContentFolderPath(resolveRequired(wsRootAbsFolderPath, wsUiContentFolderPath));
        return result;
    }

    private String resolveRequired(String rootFolderPath, String relativePath) throws GameFilesResolvingException {
        String absPath = rootFolderPath + relativePath;
        validateFile(absPath);
        return absPath;
    }

    private String resolveSteamDir() throws GameFilesResolvingException {
        LOG.debug("Resolving Steam root path");
        StringBuilder command = new StringBuilder();
        String[] regKeyValues = {steam64RegKey, steam32RegKey};
        for (String regKey : regKeyValues) {
            try {
                command.append(REG_QUERY)
                        .append(StringUtils.SPACE)
                        .append(regKey)
                        .append(StringUtils.SPACE)
                        .append(REG_VALUE)
                        .append(StringUtils.SPACE)
                        .append(steamInstallPath);
                Process process = Runtime.getRuntime().exec(command.toString());
                InputStream stream = process.getInputStream();
                process.waitFor();
                String commandResult = new String(stream.readAllBytes());
                LOG.debug("reg query execution result: {}", commandResult);
                if (commandResult.contains(REG_SZ)) {
                    return commandResult.substring(commandResult.lastIndexOf(REG_SZ) + REG_SZ.length()).trim();
                }
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            } catch (IOException ex) {
                throw new GameFilesResolvingException(ex);
            }
        }
        throw new GameFilesResolvingException("Can't find steam installation path in Windows registry");
    }

    private String resolveGamePath(String steamDir) throws GameFilesResolvingException {
        LOG.debug("Resolving Steam root path");
        try {
            File libFoldersFile = new File(steamDir + steamLibraryFoldersFile);
            String libFoldersFileContent =  Files.readString(libFoldersFile.toPath());
            VDFNode root = new VDFParser().parse(libFoldersFileContent);
            VDFNode libFoldersRoot = root.getSubNode(LIBRARY_FOLDERS);
            for (Map.Entry<String, Object[]> entry : libFoldersRoot.entrySet()) {
                VDFNode folderNode = (VDFNode) entry.getValue()[0];
                String folderPath = folderNode.getString(PATH);
                VDFNode appsNode = folderNode.getSubNode(APPS);
                if (appsNode.containsKey(steamWSAppId)) {
                    return folderPath + steamWSPath;
                }
            }
        } catch (IOException ex) {
            throw new GameFilesResolvingException(ex);
        }
        throw new GameFilesResolvingException("War Selection installation directory not found");
    }

    private void validateFile(String absPath) throws GameFilesResolvingException {
        File file = new File(absPath);
        if (!file.exists()) {
            throw new GameFilesResolvingException("File not found: " + absPath);
        }
    }
}
