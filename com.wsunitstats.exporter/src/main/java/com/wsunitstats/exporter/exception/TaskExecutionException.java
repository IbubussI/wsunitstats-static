package com.wsunitstats.exporter.exception;

public class TaskExecutionException extends Exception {
    public TaskExecutionException(Throwable cause) {
        super(cause);
    }

    public TaskExecutionException(String reason) {
        super(reason);
    }

    public TaskExecutionException(String reason, Throwable cause) {
        super(reason, cause);
    }
}
