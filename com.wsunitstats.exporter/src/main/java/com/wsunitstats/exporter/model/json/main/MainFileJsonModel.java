package com.wsunitstats.exporter.model.json.main;

import com.wsunitstats.exporter.model.json.main.submodel.GlobalContentJsonModel;
import com.wsunitstats.exporter.model.json.main.submodel.VisualSessionContentJsonModel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MainFileJsonModel {
    private Object ann;
    private Object appearancesExceptions;
    private Object contentExceptions;
    private Object fileEditor;
    private Object gameServer;
    private GlobalContentJsonModel globalContent;
    private Object messenger;
    private Object launcher;
    private Object lobby;
    private Object ratings;
    private Object render;
    private Object scriptedEvents;
    private Object scripts;
    private Object sound;
    private Object version;
    private Object visual;
    private VisualSessionContentJsonModel visualSessionContent;
    private Object window;
}
