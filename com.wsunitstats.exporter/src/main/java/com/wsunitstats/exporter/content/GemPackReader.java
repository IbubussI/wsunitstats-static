package com.wsunitstats.exporter.content;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Reads the GEMPACK container the game stores every content entity in (units, envs, projectiles).
 * <p>
 * Layout (little endian):
 * <pre>
 * char[8] magic = "GEMPACK\0"
 * u32     version
 * u32     entryCount
 * u64     tableOfContentsSize
 * entry[entryCount]:
 *     u32   nameLength
 *     u64   dataOffset (from the start of the file)
 *     u64   dataSize
 *     u32   hash
 *     char  name[nameLength]
 * data
 * </pre>
 */
public class GemPackReader {
    public static final String PACK_FILE_EXTENSION = ".pack";
    /** Separates the path of a pack file and the name of an entry inside it: {@code scripts/common.pack#cultures.lua} */
    public static final String ENTRY_SEPARATOR = "#";

    private static final byte[] MAGIC = "GEMPACK\0".getBytes(StandardCharsets.US_ASCII);
    private static final int SUPPORTED_VERSION = 1;
    private static final int HEADER_SIZE = 24;

    private GemPackReader() {
        // Utility class
    }

    /**
     * @return path of the file: of the pack for a pack entry path ({@code <pack file>#<entry name>}), else the path itself
     */
    public static String getFilePath(String path) {
        int separator = path.indexOf(PACK_FILE_EXTENSION + ENTRY_SEPARATOR);
        return separator < 0 ? path : path.substring(0, separator + PACK_FILE_EXTENSION.length());
    }

    /**
     * @return name of the entry for a pack entry path ({@code <pack file>#<entry name>}), else null
     */
    public static String getEntryName(String path) {
        int separator = path.indexOf(PACK_FILE_EXTENSION + ENTRY_SEPARATOR);
        return separator < 0 ? null : path.substring(separator + PACK_FILE_EXTENSION.length() + ENTRY_SEPARATOR.length());
    }

    /**
     * @return pack entries by name, in the order they are stored
     */
    public static Map<String, byte[]> read(byte[] bytes) {
        if (bytes.length < HEADER_SIZE || !Arrays.equals(bytes, 0, MAGIC.length, MAGIC, 0, MAGIC.length)) {
            throw new IllegalArgumentException("Not a GEMPACK file");
        }
        ByteBuffer buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        buffer.position(MAGIC.length);
        int version = buffer.getInt();
        if (version != SUPPORTED_VERSION) {
            throw new IllegalArgumentException("Unsupported GEMPACK version: " + version);
        }
        int entryCount = buffer.getInt();
        long tocSize = buffer.getLong();

        Map<String, byte[]> result = new LinkedHashMap<>();
        for (int i = 0; i < entryCount; ++i) {
            int nameLength = buffer.getInt();
            int offset = Math.toIntExact(buffer.getLong());
            int size = Math.toIntExact(buffer.getLong());
            buffer.getInt(); // hash
            byte[] name = new byte[nameLength];
            buffer.get(name);
            if (offset < 0 || size < 0 || offset + size > bytes.length) {
                throw new IllegalArgumentException("GEMPACK entry is out of file bounds");
            }
            result.put(new String(name, StandardCharsets.UTF_8), Arrays.copyOfRange(bytes, offset, offset + size));
        }
        if (buffer.position() != HEADER_SIZE + tocSize) {
            throw new IllegalArgumentException("GEMPACK table of contents size mismatch");
        }
        return result;
    }
}
