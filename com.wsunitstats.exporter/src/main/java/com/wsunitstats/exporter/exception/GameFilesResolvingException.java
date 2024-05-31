package com.wsunitstats.exporter.exception;

public class GameFilesResolvingException extends Exception {
    public GameFilesResolvingException(Throwable cause) {
        super(cause);
    }

    public GameFilesResolvingException(String reason) {
        super(reason);
    }

    public GameFilesResolvingException(String reason, Throwable cause) {
        super(reason, cause);
    }
}
