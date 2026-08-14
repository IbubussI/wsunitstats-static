package com.wsunitstats.exporter.lua;

import lombok.Getter;

import java.util.List;

/**
 * Call of a function taken from a table (a global one in practice, e.g. {@code localize("<*ageNames/0>")}),
 * kept unevaluated since the exporter is interested in the arguments only.
 */
@Getter
public class LuaFunctionCall {
    private final String functionName;
    private final List<Object> arguments;

    public LuaFunctionCall(String functionName, List<Object> arguments) {
        this.functionName = functionName;
        this.arguments = arguments;
    }

    @Override
    public String toString() {
        return functionName + arguments;
    }
}
