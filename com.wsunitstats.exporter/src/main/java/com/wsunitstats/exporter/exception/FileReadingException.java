package com.wsunitstats.exporter.exception;

public class FileReadingException extends RuntimeException {
    public FileReadingException(Throwable cause) {
        super(cause);
    }

    public FileReadingException(String reason) {
        super(reason);
    }

    public FileReadingException(String reason, Throwable cause) {
        super(reason, cause);
    }
}
