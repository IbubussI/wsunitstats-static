package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.LocalizationService;
import com.wsunitstats.exporter.service.ModelExporterService;
import lombok.Getter;
import lombok.Setter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.Writer;
import java.util.Collection;

@Component
public class WriteFileTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(WriteFileTask.class);
    private static final String TASK_NAME = "writeFile";

    @Autowired
    private ModelExporterService exporterService;
    @Autowired
    private LocalizationService localizationService;

    @Value("${file.name}")
    private String fileName;
    @Value("${file.pretty}")
    private boolean filePretty;
    @Value("${file.locale}")
    private String fileLocale;
    @Value("${file.localize}")
    private boolean fileLocalize;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            Collection<UnitModel> unitModels = payload.getUnits();
            Collection<ResearchModel> researchModels = payload.getResearches();
            ExportWrapper exportWrapper = new ExportWrapper();
            exportWrapper.setUnits(unitModels);
            exportWrapper.setResearches(researchModels);
            Collection<LocalizationModel> localizationModels = payload.getLocalization();
            try (Writer fileWriter = new FileWriter(fileName, false)) {
                LOG.info("Converting to json...");
                String unitsJson = filePretty
                        ? exporterService.exportToPrettyJson(exportWrapper)
                        : exporterService.exportToJson(exportWrapper);
                if (fileLocalize) {
                    LOG.info("Localizing...");
                    LOG.info("Locale: {}", fileLocale);
                    LocalizationModel localizationModel = localizationModels.stream()
                            .filter(locModel -> locModel.getLocale().equals(fileLocale))
                            .findAny()
                            .orElse(null);
                    unitsJson = localizationService.localize(unitsJson, localizationModel);
                }
                LOG.info("Writing to file {}", fileName);
                fileWriter.write(unitsJson);
                fileWriter.flush();
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }

    @Setter
    @Getter
    private static final class ExportWrapper {
        private Collection<UnitModel> units;
        private Collection<ResearchModel> researches;
    }
}
