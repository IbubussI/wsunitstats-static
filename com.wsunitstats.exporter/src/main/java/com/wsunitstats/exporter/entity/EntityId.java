package com.wsunitstats.exporter.entity;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Identifier of a game entity (unit, research, ...). Its form depends on how the game identifies
 * the kind of entities (e.g. an index or a path), which only the game files reading knows about:
 * the rest of the exporter treats identifiers as opaque values.
 */
public interface EntityId extends Comparable<EntityId> {
    /**
     * @return identifier value as the game files hold it, which is also how it is exported
     */
    @JsonValue
    Object getValue();

    /**
     * @return textual form of the identifier, used to build localization keys, file and image names
     */
    @Override
    String toString();
}
