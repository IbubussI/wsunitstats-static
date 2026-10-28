package com.wsunitstats.exporter.model;

/**
 * Where an image comes from: either a whole texture (e.g. an icon stored in a content pack)
 * or an interface image asset (e.g. "WarSelection/icons/units/2/archer#default"), which is a named region
 * of an atlas texture
 */
public record ImageSource(byte[] texture, String asset) {
    public static ImageSource ofTexture(byte[] texture) {
        return new ImageSource(texture, null);
    }

    public static ImageSource ofAsset(String asset) {
        return new ImageSource(null, asset);
    }

    @Override
    public String toString() {
        return texture != null ? "texture of " + texture.length + " bytes" : "asset " + asset;
    }
}
