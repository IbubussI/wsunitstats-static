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

import static com.wsunitstats.exporter.utils.Constants.FILE_PATH_DELIMITER;
import static com.wsunitstats.exporter.utils.Constants.JSON_EXTENSION;

@Component
public class ExportEngineDataJsonTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(BulkFileJsonExportTask.class);
    private static final String TASK_NAME = "exportEngineData";

    @Autowired
    private FileReaderService fileReaderService;

    @Value("${engine.tree.input.file}")
    private String inputFilePath;
    @Value("${engine.tree.output.path}")
    private String treeOutputPath;
    @Value("${engine.context.output.path}")
    private String contextOutputPath;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            LOG.info("Exporting engine data");
            LOG.info("Engine data file path {}", inputFilePath);
            LOG.info("Tree data output directory {}", treeOutputPath);
            LOG.info("Tree data output directory {}", contextOutputPath);

            LOG.info("Reading json input file");
            ObjectNode fileRoot = fileReaderService.readJson(inputFilePath, ObjectNode.class);
            EngineDataBuilder builder = new EngineDataBuilder();
            LOG.info("Generating output");
            builder.build(fileRoot);
            LOG.info("Generating output completed");

            List<FileEntry> treeFileEntries = builder.getTreeFileEntries();
            List<FileEntry> contextFileEntries = builder.getContextFileEntries();

            processEntryList(treeFileEntries, treeOutputPath);
            processEntryList(contextFileEntries, contextOutputPath);
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
