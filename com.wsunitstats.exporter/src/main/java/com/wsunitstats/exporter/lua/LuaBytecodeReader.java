package com.wsunitstats.exporter.lua;

import com.wsunitstats.exporter.exception.FileReadingException;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Reads (undumps) a chunk compiled by Lua 5.5, i.e. the binary layout produced by {@code ldump.c}.
 * Only the parts required to reconstruct constants and code are kept, debug information is skipped.
 */
public class LuaBytecodeReader {
    private static final byte[] SIGNATURE = {0x1b, 'L', 'u', 'a'};
    private static final byte[] DATA = {0x19, (byte) 0x93, '\r', '\n', 0x1a, '\n'};
    private static final int VERSION = 0x55;
    /** Sizes and sample values of int, Instruction, lua_Integer and lua_Number written into the header */
    private static final int HEADER_TYPE_CHECKS = 4;

    private static final int TAG_NIL = 0x00;
    private static final int TAG_FALSE = 0x01;
    private static final int TAG_TRUE = 0x11;
    private static final int TAG_INTEGER = 0x03;
    private static final int TAG_FLOAT = 0x13;
    private static final int TAG_SHORT_STRING = 0x04;
    private static final int TAG_LONG_STRING = 0x14;

    private static final int INT_SIZE = 4;
    private static final int INSTRUCTION_SIZE = 4;
    private static final int NUMBER_SIZE = 8;
    private static final int UPVALUE_SIZE = 3;
    private static final int ABS_LINE_INFO_SIZE = 2 * INT_SIZE;

    private final byte[] data;
    /** Strings already read: repeated ones are dumped as a reference to this list */
    private final List<String> readStrings = new ArrayList<>();
    private int position;

    private LuaBytecodeReader(byte[] data) {
        this.data = data;
    }

    /**
     * @return prototype of the main function of the chunk
     */
    public static LuaPrototype read(byte[] data) {
        LuaBytecodeReader reader = new LuaBytecodeReader(data);
        reader.readHeader();
        reader.readByte(); // upvalues count of the main closure
        return reader.readFunction();
    }

    private void readHeader() {
        expect(SIGNATURE, "not a Lua chunk");
        int version = readByte();
        if (version != VERSION) {
            throw new FileReadingException(String.format("Unsupported Lua bytecode version: 0x%02x, expected 0x%02x",
                    version, VERSION));
        }
        readByte(); // format
        expect(DATA, "corrupted Lua chunk");
        for (int i = 0; i < HEADER_TYPE_CHECKS; ++i) {
            skip(readByte());
        }
    }

    private LuaPrototype readFunction() {
        readVarint(); // line defined
        readVarint(); // last line defined
        readByte();   // params count
        readByte();   // flags
        readByte();   // max stack size

        int codeSize = readInt();
        align(INSTRUCTION_SIZE);
        int[] code = new int[codeSize];
        for (int i = 0; i < codeSize; ++i) {
            code[i] = readInstruction();
        }

        int constantsSize = readInt();
        List<Object> constants = new ArrayList<>(constantsSize);
        for (int i = 0; i < constantsSize; ++i) {
            constants.add(readConstant());
        }

        int upvaluesSize = readInt();
        skip(upvaluesSize * UPVALUE_SIZE);

        int prototypesSize = readInt();
        List<LuaPrototype> prototypes = new ArrayList<>(prototypesSize);
        for (int i = 0; i < prototypesSize; ++i) {
            prototypes.add(readFunction());
        }

        readString(); // source
        readDebug(upvaluesSize);

        return new LuaPrototype(code, constants, prototypes);
    }

    /**
     * Debug info is not used by the exporter, but its strings share the numbering of the reused ones,
     * so they have to be read the same way as any other string.
     */
    private void readDebug(int upvaluesSize) {
        skip(readInt()); // line info
        int absLineInfoSize = readInt();
        if (absLineInfoSize > 0) {
            align(INT_SIZE);
            skip(absLineInfoSize * ABS_LINE_INFO_SIZE);
        }
        int localsSize = readInt();
        for (int i = 0; i < localsSize; ++i) {
            readString(); // name
            readVarint(); // start pc
            readVarint(); // end pc
        }
        int upvalueNamesSize = readInt() == 0 ? 0 : upvaluesSize;
        for (int i = 0; i < upvalueNamesSize; ++i) {
            readString();
        }
    }

    private Object readConstant() {
        int tag = readByte();
        return switch (tag) {
            case TAG_NIL -> null;
            case TAG_FALSE -> Boolean.FALSE;
            case TAG_TRUE -> Boolean.TRUE;
            case TAG_INTEGER -> readInteger();
            case TAG_FLOAT -> readNumber();
            case TAG_SHORT_STRING, TAG_LONG_STRING -> readString();
            default -> throw new FileReadingException(String.format("Unknown Lua constant tag 0x%02x at offset %d",
                    tag, position - 1));
        };
    }

    private String readString() {
        int size = readInt();
        if (size == 0) {
            int index = readInt();
            if (index == 0) {
                return null;
            }
            if (index > readStrings.size()) {
                throw new FileReadingException("Invalid Lua string reference: " + index);
            }
            return readStrings.get(index - 1);
        }
        // the dumped content includes the trailing '\0'
        require(size);
        String value = new String(data, position, size - 1, StandardCharsets.UTF_8);
        position += size;
        readStrings.add(value);
        return value;
    }

    /**
     * Signed integers are dumped as unsigned ones with the sign kept in the lowest bit.
     */
    private Long readInteger() {
        long encoded = readVarint();
        return (encoded & 1) == 0 ? encoded >>> 1 : ~(encoded >>> 1);
    }

    private Double readNumber() {
        require(NUMBER_SIZE);
        long bits = 0;
        for (int i = NUMBER_SIZE - 1; i >= 0; --i) {
            bits = (bits << 8) | (data[position + i] & 0xffL);
        }
        position += NUMBER_SIZE;
        return Double.longBitsToDouble(bits);
    }

    private int readInstruction() {
        require(INSTRUCTION_SIZE);
        int value = 0;
        for (int i = INSTRUCTION_SIZE - 1; i >= 0; --i) {
            value = (value << 8) | (data[position + i] & 0xff);
        }
        position += INSTRUCTION_SIZE;
        return value;
    }

    private int readInt() {
        long value = readVarint();
        if (value > Integer.MAX_VALUE) {
            throw new FileReadingException("Lua integer value is too big: " + value);
        }
        return (int) value;
    }

    /**
     * Variable length integer: 7 bits per byte, most significant group first,
     * the highest bit marks that another byte follows.
     */
    private long readVarint() {
        long value = 0;
        int read;
        do {
            read = readByte();
            value = (value << 7) | (read & 0x7f);
        } while ((read & 0x80) != 0);
        return value;
    }

    private int readByte() {
        require(1);
        return data[position++] & 0xff;
    }

    /**
     * Blocks bigger than a byte are dumped aligned to their size, relative to the beginning of the chunk.
     */
    private void align(int alignment) {
        int padding = alignment - position % alignment;
        if (padding < alignment) {
            skip(padding);
        }
    }

    private void skip(int count) {
        require(count);
        position += count;
    }

    private void expect(byte[] expected, String message) {
        require(expected.length);
        for (int i = 0; i < expected.length; ++i) {
            if (data[position + i] != expected[i]) {
                throw new FileReadingException("Reading Lua bytecode failed: " + message);
            }
        }
        position += expected.length;
    }

    private void require(int count) {
        if (count < 0 || position + count > data.length) {
            throw new FileReadingException("Truncated Lua chunk at offset " + position);
        }
    }
}
