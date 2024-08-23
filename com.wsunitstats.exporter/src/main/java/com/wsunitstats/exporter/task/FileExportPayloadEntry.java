package com.wsunitstats.exporter.task;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileExportPayloadEntry<T> {
    private String filename;
    private T exportedObject;
}
