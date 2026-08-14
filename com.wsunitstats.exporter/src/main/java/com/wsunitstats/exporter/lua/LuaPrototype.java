package com.wsunitstats.exporter.lua;

import lombok.Getter;

import java.util.List;

/**
 * Function prototype of a compiled Lua chunk: the pieces of the dump which are needed
 * to reconstruct the values the chunk builds. Debug information is dropped while reading.
 */
@Getter
public class LuaPrototype {
    private final int[] code;
    private final List<Object> constants;
    private final List<LuaPrototype> prototypes;

    public LuaPrototype(int[] code, List<Object> constants, List<LuaPrototype> prototypes) {
        this.code = code;
        this.constants = constants;
        this.prototypes = prototypes;
    }

    public Object getConstant(int index) {
        if (index < 0 || index >= constants.size()) {
            throw new IllegalArgumentException("Constant index out of bounds: " + index);
        }
        return constants.get(index);
    }
}
