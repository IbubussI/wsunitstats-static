package com.wsunitstats.exporter.service.impl;

public enum EngineNodeType {
    STRING("str", "String"),
    BOOLEAN("bool", "Boolean"),
    NUMBER("num", "Number"),
    OBJECT("obj", "Object"),
    ARRAY("array", "Array"),
    FUNCTION_ARGS("farg", "Function Args"),
    FUNCTION("func", "Function"),
    TAGS("tags", "Tags"),
    ROOT("root", "TreeRoot"),
    HOME("home", "Home"),
    FOLDER("folder", "Folder");

    private final String id;
    private final String label;

    EngineNodeType(String id, String label) {
        this.id = id;
        this.label = label;
    }

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }
}
