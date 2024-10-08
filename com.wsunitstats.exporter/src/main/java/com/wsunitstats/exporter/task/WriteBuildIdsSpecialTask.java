package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.service.LocalizationService;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.Comparator;
import java.util.stream.Collectors;

/**
 * Task to get any file with any content (for informational and test purposes)
 */
@Component
public class WriteBuildIdsSpecialTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(WriteBuildIdsSpecialTask.class);
    private static final String TASK_NAME = "writeBuildIdsSpecial";
    private static final String FILENAME = "specialTaskResults.txt";
    private static final String LOCALE = "en";

    @Autowired
    private ModelExporterService exporterService;
    @Autowired
    private LocalizationService localizationService;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            Collection<UnitModel> unitModels = payload.getUnits();
            Collection<LocalizationModel> localizationModels = payload.getLocalization();
            try (Writer fileWriter = new FileWriter(FILENAME, false)) {
                LOG.info("Converting data to string...");

                // change this to whatever is needed;
                String content = getBuildIdList(unitModels);

                LocalizationModel localizationModel = localizationModels.stream()
                        .filter(locModel -> locModel.getLocale().equals(LOCALE))
                        .findAny()
                        .orElse(null);
                String localized = localizationService.localize(content, localizationModel);

                LOG.info("Writing to file {}", FILENAME);
                fileWriter.write(localized);
                fileWriter.flush();
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }

    private String getBuildIdList(Collection<UnitModel> unitModels) {
        String template = "%s -> %s(%s):[%s]";
        return unitModels.stream()
                .filter(unitModel -> unitModel.getBuild() != null)
                .sorted(Comparator.comparingInt(unitModel -> unitModel.getBuild().getBuildId()))
                .map(unitModel -> String.format(template, unitModel.getBuild().getBuildId(), unitModel.getName(), unitModel.getNation(), unitModel.getGameId()))
                .collect(Collectors.joining(StringUtils.LF));
    }
}
