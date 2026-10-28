package com.wsunitstats.exporter.content;

import io.airlift.compress.zstd.ZstdDecompressor;

import java.awt.image.BufferedImage;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Arrays;

/**
 * Decodes the KTX2 textures the game uses for icons into images.
 * <p>
 * Only the formats met in the game files are supported: uncompressed 8-bit RGBA pixels
 * (either UNORM or SRGB, which are stored identically), with or without Zstandard supercompression.
 * The first (largest) mip level is decoded.
 */
public class Ktx2Reader {
    public static final String KTX2_FILE_EXTENSION = ".ktx2";

    private static final byte[] IDENTIFIER = {
            (byte) 0xAB, 'K', 'T', 'X', ' ', '2', '0', (byte) 0xBB, '\r', '\n', 0x1A, '\n'
    };
    private static final int VK_FORMAT_R8G8B8A8_UNORM = 37;
    private static final int VK_FORMAT_R8G8B8A8_SRGB = 43;
    private static final int SUPERCOMPRESSION_NONE = 0;
    private static final int SUPERCOMPRESSION_ZSTD = 2;
    private static final int LEVEL_INDEX_OFFSET = 80;
    private static final int BYTES_PER_PIXEL = 4;

    private Ktx2Reader() {
        // Utility class
    }

    public static boolean isKtx2(byte[] bytes) {
        return bytes.length >= IDENTIFIER.length && Arrays.equals(bytes, 0, IDENTIFIER.length, IDENTIFIER, 0, IDENTIFIER.length);
    }

    public static BufferedImage read(byte[] bytes) {
        if (!isKtx2(bytes)) {
            throw new IllegalArgumentException("Not a KTX2 file");
        }
        ByteBuffer buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        int vkFormat = buffer.getInt(12);
        int width = buffer.getInt(20);
        int height = buffer.getInt(24);
        int supercompression = buffer.getInt(44);
        if (vkFormat != VK_FORMAT_R8G8B8A8_UNORM && vkFormat != VK_FORMAT_R8G8B8A8_SRGB) {
            throw new IllegalArgumentException("Unsupported KTX2 pixel format: " + vkFormat);
        }

        int levelOffset = Math.toIntExact(buffer.getLong(LEVEL_INDEX_OFFSET));
        int levelLength = Math.toIntExact(buffer.getLong(LEVEL_INDEX_OFFSET + 8));
        int expectedLength = width * height * BYTES_PER_PIXEL;
        byte[] pixels = switch (supercompression) {
            case SUPERCOMPRESSION_NONE -> Arrays.copyOfRange(bytes, levelOffset, levelOffset + levelLength);
            case SUPERCOMPRESSION_ZSTD -> {
                byte[] output = new byte[expectedLength];
                new ZstdDecompressor().decompress(bytes, levelOffset, levelLength, output, 0, output.length);
                yield output;
            }
            default -> throw new IllegalArgumentException("Unsupported KTX2 supercompression: " + supercompression);
        };
        if (pixels.length < expectedLength) {
            throw new IllegalArgumentException("KTX2 level data is too short");
        }

        // Rows are stored top to bottom (KTXorientation "rd")
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        int[] argb = new int[width * height];
        for (int i = 0; i < argb.length; ++i) {
            int p = i * BYTES_PER_PIXEL;
            int r = pixels[p] & 0xff;
            int g = pixels[p + 1] & 0xff;
            int b = pixels[p + 2] & 0xff;
            int a = pixels[p + 3] & 0xff;
            argb[i] = (a << 24) | (r << 16) | (g << 8) | b;
        }
        image.setRGB(0, 0, width, height, argb, 0, width);
        return image;
    }
}
