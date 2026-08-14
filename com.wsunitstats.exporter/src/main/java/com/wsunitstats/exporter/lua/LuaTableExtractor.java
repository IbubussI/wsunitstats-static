package com.wsunitstats.exporter.lua;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reconstructs the values a compiled chunk assigns to named places (globals and table fields)
 * by walking through its instructions and keeping track of what every register holds.
 * <p>
 * Only straight line code is followed, which is enough for the plain lists of localization keys
 * the exporter reads. Everything the walk cannot resolve statically becomes {@link #UNKNOWN}.
 */
public class LuaTableExtractor {
    /** Value which cannot be determined without actually running the chunk */
    public static final Object UNKNOWN = new Object() {
        @Override
        public String toString() {
            return "<unknown>";
        }
    };

    private static final int OFFSET_SBX = 65535;
    private static final int MAX_ARG_VC = 1023;

    private LuaTableExtractor() {
        // Utility class
    }

    /**
     * @return values assigned by the chunk to named places, by name. If a name is assigned
     * several times the last assignment wins, the same way it does at runtime.
     */
    public static Map<String, Object> extractNamedValues(LuaPrototype main) {
        Map<String, Object> result = new LinkedHashMap<>();
        extract(main, result);
        return result;
    }

    private static void extract(LuaPrototype prototype, Map<String, Object> result) {
        Map<Integer, Object> registers = new HashMap<>();
        int[] code = prototype.getCode();
        int top = 0;
        for (int pc = 0; pc < code.length; ++pc) {
            int instruction = code[pc];
            LuaOpCode opCode = LuaOpCode.of(instruction & 0x7f);
            int a = (instruction >>> 7) & 0xff;
            boolean k = ((instruction >>> 15) & 1) != 0;
            int b = (instruction >>> 16) & 0xff;
            int c = (instruction >>> 24) & 0xff;
            int vb = (instruction >>> 16) & 0x3f;
            int vc = (instruction >>> 22) & 0x3ff;
            int bx = (instruction >>> 15) & 0x1ffff;

            switch (opCode) {
                case LOADK -> registers.put(a, prototype.getConstant(bx));
                case LOADKX -> registers.put(a, prototype.getConstant(extraArg(code, pc)));
                case LOADI -> registers.put(a, (long) (bx - OFFSET_SBX));
                case LOADF -> registers.put(a, (double) (bx - OFFSET_SBX));
                case LOADTRUE -> registers.put(a, Boolean.TRUE);
                case LOADFALSE, LFALSESKIP -> registers.put(a, Boolean.FALSE);
                case LOADNIL -> {
                    for (int register = a; register <= a + b; ++register) {
                        registers.put(register, null);
                    }
                }
                case NEWTABLE -> registers.put(a, new LuaTable());
                case GETTABUP -> registers.put(a, new GlobalReference((String) prototype.getConstant(c)));
                case SETI -> put(registers.get(a), (long) b, readRK(prototype, registers, c, k), result);
                case SETFIELD -> put(registers.get(a), prototype.getConstant(b), readRK(prototype, registers, c, k), result);
                case SETTABLE -> put(registers.get(a), registers.get(b), readRK(prototype, registers, c, k), result);
                // globals are fields of the _ENV upvalue, so there is no register holding their table
                case SETTABUP -> put(null, prototype.getConstant(b), readRK(prototype, registers, c, k), result);
                case SETLIST -> {
                    long start = k ? vc + (long) extraArg(code, pc) * (MAX_ARG_VC + 1) : vc;
                    int count = vb != 0 ? vb : Math.max(0, top - (a + 1));
                    if (registers.get(a) instanceof LuaTable table) {
                        for (int i = 1; i <= count; ++i) {
                            table.put(start + i, registers.getOrDefault(a + i, UNKNOWN));
                        }
                    }
                }
                case CALL -> top = call(registers, a, b, c);
                default -> {
                    if (opCode.isAssigningToA()) {
                        registers.put(a, UNKNOWN);
                    }
                }
            }
        }
        prototype.getPrototypes().forEach(nested -> extract(nested, result));
    }

    /**
     * @return stack top after the call, which the following instructions rely on
     * when the call returns an unknown amount of values
     */
    private static int call(Map<Integer, Object> registers, int a, int b, int c) {
        Object result = UNKNOWN;
        if (b >= 1 && registers.get(a) instanceof GlobalReference reference) {
            List<Object> arguments = new ArrayList<>(b - 1);
            for (int i = 1; i < b; ++i) {
                arguments.add(registers.getOrDefault(a + i, UNKNOWN));
            }
            result = new LuaFunctionCall(reference.name(), arguments);
        }
        int returnedValues = c - 1;
        if (returnedValues < 0) {
            // the call returns everything it has, a single value in practice
            registers.put(a, result);
            return a + 1;
        }
        for (int i = 0; i < returnedValues; ++i) {
            registers.put(a + i, i == 0 ? result : UNKNOWN);
        }
        return a + returnedValues;
    }

    /**
     * Puts the value into the given table, if it is known, and remembers it by its name
     * when the key is a string, no matter what table it belongs to.
     */
    private static void put(Object table, Object key, Object value, Map<String, Object> result) {
        if (table instanceof LuaTable luaTable && key != null && key != UNKNOWN) {
            luaTable.put(key, value);
        }
        if (key instanceof String name) {
            result.put(name, value);
        }
    }

    /**
     * @param isConstant whether the argument refers to a constant instead of a register
     */
    private static Object readRK(LuaPrototype prototype, Map<Integer, Object> registers, int argument, boolean isConstant) {
        return isConstant ? prototype.getConstant(argument) : registers.getOrDefault(argument, UNKNOWN);
    }

    private static int extraArg(int[] code, int pc) {
        if (pc + 1 >= code.length || LuaOpCode.of(code[pc + 1] & 0x7f) != LuaOpCode.EXTRAARG) {
            throw new IllegalStateException("EXTRAARG instruction expected at " + (pc + 1));
        }
        return code[pc + 1] >>> 7;
    }

    /**
     * Value taken from a table by name, the way globals are read
     */
    private record GlobalReference(String name) {
    }
}
