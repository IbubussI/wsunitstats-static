package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import lombok.Getter;
import lombok.Setter;

import java.awt.image.BufferedImage;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class ExecutionPayload {
    private List<UnitModel> units;
    private List<ResearchModel> researches;
    private List<LocalizationModel> localization;
    private Map<String, BufferedImage> images;
    private String hostname;
    private String authPath;
    private String username;
    private String password;
}
