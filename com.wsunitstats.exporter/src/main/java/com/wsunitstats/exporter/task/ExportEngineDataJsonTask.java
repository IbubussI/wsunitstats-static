package com.wsunitstats.exporter.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.EngineDataBuilder;
import com.wsunitstats.exporter.service.FileReaderService;
import com.wsunitstats.exporter.service.impl.FileEntry;
import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.List;
import java.util.Map;

import static com.wsunitstats.exporter.utils.Constants.FILE_PATH_DELIMITER;
import static com.wsunitstats.exporter.utils.Constants.JSON_EXTENSION;

@Component
public class ExportEngineDataJsonTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(BulkFileJsonExportTask.class);
    private static final String TASK_NAME = "exportEngineData";

    @Autowired
    private FileReaderService fileReaderService;

    @Value("${docs.input.file.gameplay}")
    private String gameplayInputFilePath;
    @Value("${docs.input.file.visual}")
    private String visualInputFilePath;
    @Value("${docs.output.root}")
    private String outputRootPath;
    @Value("${docs.output.gameplay}")
    private String gameplayPath;
    @Value("${docs.output.visual}")
    private String visualPath;
    @Value("${docs.output.tree}")
    private String treePath;
    @Value("${docs.output.context}")
    private String contextPath;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            LOG.info("Exporting engine data");
            LOG.info("Engine gameplay data file path {}", gameplayInputFilePath);
            LOG.info("Engine visual data file path {}", visualInputFilePath);
            LOG.info("Data output directory {}", outputRootPath);

            LOG.info("Reading json input file");
            ObjectNode gameplayRoot = fileReaderService.readJson(gameplayInputFilePath, ObjectNode.class);
            ObjectNode visualRoot = fileReaderService.readJson(visualInputFilePath, ObjectNode.class);
            EngineDataBuilder gameplayBuilder = new EngineDataBuilder();
            LOG.info("Generating output");
            gameplayBuilder.build(Map.of(gameplayPath, gameplayRoot, visualPath, visualRoot));
            LOG.info("Generating output completed");

            List<FileEntry> treeFileEntries = gameplayBuilder.getTreeFileEntries();
            List<FileEntry> contextFileEntries = gameplayBuilder.getContextFileEntries();

            processEntryList(treeFileEntries, String.join("/", outputRootPath, treePath));
            processEntryList(contextFileEntries, String.join("/", outputRootPath, contextPath));
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }

    private void processEntryList(List<FileEntry> entryList, String outputPath)
            throws TaskExecutionException, IOException {
        File dir = new File(outputPath);
        if (dir.exists()) {
            LOG.info("Removing output directory {}", outputPath);
            FileUtils.deleteDirectory(dir);
        }

        if (dir.mkdirs()) {
            for (FileEntry entry : entryList) {
                Object content = entry.content();
                String filename = entry.filename();
                String filePath = outputPath + FILE_PATH_DELIMITER + filename + JSON_EXTENSION;
                File entryDir = new File(outputPath);
                if (entryDir.exists() || entryDir.mkdirs()) {
                    LOG.info("Processing file {}", filePath);
                    ObjectMapper mapper = new ObjectMapper();
                    String json = mapper.writeValueAsString(content);
                    File file = new File(filePath);
                    try (Writer fileWriter = new FileWriter(file)) {
                        fileWriter.write(json);
                        fileWriter.flush();
                    }
                } else {
                    throw new TaskExecutionException("Cannot create/access file directory: " + entryDir);
                }
            }
        } else {
            throw new TaskExecutionException("Cannot create/access file directory: " + outputPath);
        }
    }
}
