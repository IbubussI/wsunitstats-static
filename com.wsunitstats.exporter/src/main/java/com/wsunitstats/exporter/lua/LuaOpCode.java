package com.wsunitstats.exporter.lua;

/**
 * Lua 5.5 opcodes, declared in the order they are numbered in {@code lopcodes.h}.
 */
public enum LuaOpCode {
    MOVE(true), LOADI(true), LOADF(true), LOADK(true), LOADKX(true), LOADFALSE(true),
    LFALSESKIP(true), LOADTRUE(true), LOADNIL(true), GETUPVAL(true), SETUPVAL(false),
    GETTABUP(true), GETTABLE(true), GETI(true), GETFIELD(true), SETTABUP(false),
    SETTABLE(false), SETI(false), SETFIELD(false), NEWTABLE(true), SELF(true), ADDI(true),
    ADDK(true), SUBK(true), MULK(true), MODK(true), POWK(true), DIVK(true), IDIVK(true),
    BANDK(true), BORK(true), BXORK(true), SHLI(true), SHRI(true), ADD(true), SUB(true),
    MUL(true), MOD(true), POW(true), DIV(true), IDIV(true), BAND(true), BOR(true), BXOR(true),
    SHL(true), SHR(true), MMBIN(false), MMBINI(false), MMBINK(false), UNM(true), BNOT(true),
    NOT(true), LEN(true), CONCAT(true), CLOSE(false), TBC(false), JMP(false), EQ(false), LT(false),
    LE(false), EQK(false), EQI(false), LTI(false), LEI(false), GTI(false), GEI(false), TEST(false),
    TESTSET(true), CALL(true), TAILCALL(false), RETURN(false), RETURN0(false), RETURN1(false),
    FORLOOP(true), FORPREP(true), TFORPREP(false), TFORCALL(true), TFORLOOP(true),
    SETLIST(false), CLOSURE(true), VARARG(true), GETVARG(true), ERRNNIL(false),
    VARARGPREP(false), EXTRAARG(false);

    private static final LuaOpCode[] VALUES = values();

    /** Whether the instruction assigns something to the register given by its A argument */
    private final boolean assigningToA;

    LuaOpCode(boolean assigningToA) {
        this.assigningToA = assigningToA;
    }

    public boolean isAssigningToA() {
        return assigningToA;
    }

    public static LuaOpCode of(int opCode) {
        if (opCode < 0 || opCode >= VALUES.length) {
            throw new IllegalArgumentException("Unknown Lua opcode: " + opCode);
        }
        return VALUES[opCode];
    }
}
