package com.wsunitstats.exporter.service;

import com.wsunitstats.exporter.exception.GameFilesResolvingException;
import com.wsunitstats.exporter.model.FilePathWrapper;

import java.io.IOException;

public interface FilePathResolver {
    FilePathWrapper resolve() throws IOException, GameFilesResolvingException;
}
