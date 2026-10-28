package com.wsunitstats.exporter.content.entity;

import com.wsunitstats.exporter.entity.EntityId;

/**
 * Identifier of an entity the game identifies by its path (address) in the content storage,
 * e.g. "WarSelection/5/paratrooper/soldier"
 */
public record PathEntityId(String path) implements EntityId {
    @Override
    public Object getValue() {
        return path;
    }

    @Override
    public int compareTo(EntityId other) {
        return other instanceof PathEntityId otherPath
                ? path.compareTo(otherPath.path)
                : getClass().getName().compareTo(other.getClass().getName());
    }

    @Override
    public String toString() {
        return path;
    }
}
