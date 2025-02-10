package com.wsunitstats.exporter.service.impl;

public enum UpgradeType {
    AGE_TRANSITION("ageTransition"),
    WONDER_TRANSITION("wonderTransition"),
    OTHER("other");

    private final String type;

    UpgradeType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
