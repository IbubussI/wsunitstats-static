package com.wsunitstats.exporter;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.service.FileContentService;
import com.wsunitstats.exporter.service.LocalizationModelResolver;
import com.wsunitstats.exporter.service.ModelResolver;
import com.wsunitstats.exporter.task.ExecutionPayload;
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

import java.util.List;

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
        private ModelResolver modelResolver;
        @Autowired
        private LocalizationModelResolver localizationModelResolver;
        @Autowired
        private TaskExecutionPool taskExecutionPool;
        @Autowired
        private FileContentService fileContentService;

        @Value("${com.wsunitstats.exporter.upload.host}")
        private String uploadHost;
        @Value("${com.wsunitstats.exporter.upload.auth.username}")
        private String username;
        @Value("${com.wsunitstats.exporter.upload.auth.password}")
        private String password;
        @Value("${com.wsunitstats.exporter.upload.auth}")
        private String authUriPath;
        @Value("${com.wsunitstats.exporter.tasks}")
        private List<String> tasks;

        @Override
        public void run(String... args) {
            if (tasks.isEmpty()) {
                LOG.error("No tasks configured");
                return;
            }

            LOG.info("Transforming files to data model...");
            List<UnitModel> unitModels = modelResolver.resolveUnits();
            List<ResearchModel> researchModels = modelResolver.resolveResearches();
            List<LocalizationModel> localizationModels = fileContentService.getLocalizationFileModels().stream()
                    .map(locFile -> localizationModelResolver.resolveFromJsonModel(locFile))
                    .toList();

            LOG.info("Executing configured tasks...");
            ExecutionPayload payload = new ExecutionPayload();
            payload.setUnits(unitModels);
            payload.setResearches(researchModels);
            payload.setLocalization(localizationModels);
            payload.setImages(fileContentService.getImages());
            payload.setHostname(uploadHost);
            payload.setAuthPath(authUriPath);
            payload.setUsername(username);
            payload.setPassword(password);
            taskExecutionPool.executeTasks(tasks, payload);
            LOG.info("Exiting...");
        }
    }
}