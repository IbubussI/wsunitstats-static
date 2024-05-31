package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;

public interface ExecutionTask {
    String getName();

    void execute(ExecutionPayload payload) throws TaskExecutionException;
}
