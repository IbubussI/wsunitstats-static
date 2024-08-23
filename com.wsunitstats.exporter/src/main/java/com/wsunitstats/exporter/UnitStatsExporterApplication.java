package com.wsunitstats.exporter;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.ContextModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.UnitSelectorModel;
import com.wsunitstats.exporter.model.exported.option.NationOption;
import com.wsunitstats.exporter.model.exported.option.ResearchOption;
import com.wsunitstats.exporter.model.exported.option.TagOption;
import com.wsunitstats.exporter.model.exported.option.UnitOption;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.LocalizationModelBuilder;
import com.wsunitstats.exporter.service.ModelBuilder;
import com.wsunitstats.exporter.service.OptionsBuilder;
import com.wsunitstats.exporter.task.ExecutionPayload;
import com.wsunitstats.exporter.task.FileExportPayloadEntry;
import com.wsunitstats.exporter.task.TaskExecutionPool;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@SpringBootApplication
@ComponentScan({"com.wsunitstats.*"})
public class UnitStatsExporterApplication {
    public static void main(String[] args) {
        SpringApplication.run(UnitStatsExporterApplication.class, args);
    }

    @Component
    public static class ExporterRunner implements CommandLineRunner {
        private static final Logger LOG = LogManager.getLogger(ExporterRunner.class);

        @Autowired
        private ModelBuilder modelBuilder;
        @Autowired
        private LocalizationModelBuilder localizationModelBuilder;
        @Autowired
        private OptionsBuilder optionsBuilder;
        @Autowired
        private TaskExecutionPool taskExecutionPool;
        @Autowired
        private FileContentService fileContentService;

        @Value("${tasks}")
        private List<String> tasks;

        @Override
        public void run(String... args) {
            if (tasks.isEmpty()) {
                LOG.error("No tasks configured");
                return;
            }

            LOG.info("Transforming files to data model...");
            List<UnitModel> unitModels = modelBuilder.buildUnits();
            List<ResearchModel> researchModels = modelBuilder.buildResearches();
            List<LocalizationModel> localizationModels = fileContentService.getLocalizationFileModels().stream()
                    .map(locFile -> localizationModelBuilder.buildFromFileModel(locFile))
                    .toList();
            Map<String, Map<String, String>> localizationMap = localizationModels.stream()
                    .collect(Collectors.toMap(LocalizationModel::getLocale, LocalizationModel::getEntries));

            Collection<UnitOption> unitOptions = optionsBuilder.buildUnitOptions(unitModels);
            Collection<ResearchOption> researchOptions = optionsBuilder.buildResearchOptions(researchModels);
            Collection<String> localeOptions = optionsBuilder.buildLocaleOptions(localizationModels);
            Collection<TagOption> unitTagOptions = optionsBuilder.buildUnitTagOptions(unitModels);
            Collection<TagOption> searchTagOptions = optionsBuilder.buildSearchTagOptions(unitModels);
            Collection<NationOption> nationOptions = optionsBuilder.buildNationsOptions(unitModels);

            UnitSelectorModel unitSelector = new UnitSelectorModel();
            unitSelector.setUnitTags(unitTagOptions);
            unitSelector.setSearchTags(searchTagOptions);
            unitSelector.setNations(nationOptions);

            ContextModel context = new ContextModel();
            context.setResearches(researchOptions);
            context.setUnits(unitOptions);
            context.setLocalization(localizationMap);
            context.setLocaleOptions(localeOptions);

            LOG.info("Executing configured tasks...");
            ExecutionPayload payload = new ExecutionPayload();
            payload.setUnits(unitModels);
            payload.setResearches(researchModels);
            payload.setLocalization(localizationModels);
            payload.setImages(fileContentService.getImages());
            payload.setUnitSelector(new FileExportPayloadEntry<>("unitSelector", unitSelector));
            payload.setContext(new FileExportPayloadEntry<>("context", context));
            taskExecutionPool.executeTasks(tasks, payload);
            LOG.info("Exiting...");
        }
    }
}