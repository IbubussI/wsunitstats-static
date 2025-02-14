package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.ResearchModel;
import com.wsunitstats.exporter.model.exported.ContextModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.UnitSelectorModel;
import lombok.Getter;
import lombok.Setter;

import java.awt.image.BufferedImage;
import java.util.Collection;
import java.util.Map;

@Getter
@Setter
public class ExecutionPayload {
    private Collection<UnitModel> units;
    private Collection<ResearchModel> researches;
    private Map<String, BufferedImage> images;
    private FileExportPayloadEntry<UnitSelectorModel> unitSelector;
    private FileExportPayloadEntry<ContextModel> context;
    private Collection<LocalizationModel> localization;
}
