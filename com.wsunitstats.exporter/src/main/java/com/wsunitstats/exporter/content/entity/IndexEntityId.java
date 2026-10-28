package com.wsunitstats.exporter.content.entity;

import com.wsunitstats.exporter.entity.EntityId;

/**
 * Identifier of an entity the game identifies by its index in a list
 */
public record IndexEntityId(int index) implements EntityId {
    @Override
    public Object getValue() {
        return index;
    }

    @Override
    public int compareTo(EntityId other) {
        return other instanceof IndexEntityId otherIndex
                ? Integer.compare(index, otherIndex.index)
                : getClass().getName().compareTo(other.getClass().getName());
    }

    @Override
    public String toString() {
        return String.valueOf(index);
    }
}
