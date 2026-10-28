package com.wsunitstats.exporter.entity;

import java.util.List;
import java.util.Optional;
import java.util.function.BiConsumer;

/**
 * Access to the game entities of one kind by their identifiers, independent of the form the identifiers have
 *
 * @param <T> entity model
 */
public interface EntityProvider<T> {
    EntityKind getKind();

    /**
     * @return identifiers of all the entities, in a stable order
     */
    List<EntityId> getIds();

    /**
     * @return entity with the given identifier or null if there is none
     */
    T get(EntityId id);

    boolean contains(EntityId id);

    /**
     * Finds an entity by a reference to it written the way the game files or the exporter configuration
     * refer to entities of this kind (e.g. "12" or "WarSelection/2/e/archer")
     *
     * @return identifier of the referenced entity or empty if there is no such entity
     */
    Optional<EntityId> find(String reference);

    /**
     * Same as {@link #find(String)}, for references that must be valid
     *
     * @throws IllegalArgumentException if there is no such entity
     */
    default EntityId resolve(String reference) {
        return find(reference).orElseThrow(() -> new IllegalArgumentException("Unknown " + getKind() + " reference: [" + reference + "]"));
    }

    default void forEach(BiConsumer<EntityId, T> action) {
        getIds().forEach(id -> action.accept(id, get(id)));
    }
}
