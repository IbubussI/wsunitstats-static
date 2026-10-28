package com.wsunitstats.exporter.content.entity;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityKind;
import com.wsunitstats.exporter.entity.EntityProvider;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

/**
 * Provider of entities the game identifies by index in a list (e.g. researches in gameplay.json).
 * The identifiers are known from the list size, so references can be resolved before the entities are read.
 */
public class IndexEntityProvider<T> implements EntityProvider<T> {
    private final EntityKind kind;
    private final List<T> entities;
    private final List<EntityId> ids;

    public IndexEntityProvider(EntityKind kind, int size) {
        this.kind = kind;
        this.entities = new ArrayList<>(Collections.nCopies(size, null));
        this.ids = IntStream.range(0, size).<EntityId>mapToObj(IndexEntityId::new).toList();
    }

    public void set(int index, T entity) {
        entities.set(index, entity);
    }

    /**
     * Sets all the entities at once, in index order
     */
    public void setAll(List<T> entities) {
        if (entities.size() != this.entities.size()) {
            throw new IllegalArgumentException(kind + " count changed: " + this.entities.size() + " -> " + entities.size());
        }
        for (int i = 0; i < entities.size(); i++) {
            set(i, entities.get(i));
        }
    }

    @Override
    public EntityKind getKind() {
        return kind;
    }

    @Override
    public List<EntityId> getIds() {
        return ids;
    }

    @Override
    public T get(EntityId id) {
        return contains(id) ? entities.get(((IndexEntityId) id).index()) : null;
    }

    @Override
    public boolean contains(EntityId id) {
        return id instanceof IndexEntityId indexId && indexId.index() >= 0 && indexId.index() < entities.size();
    }

    @Override
    public Optional<EntityId> find(String reference) {
        try {
            EntityId id = new IndexEntityId(Integer.parseInt(reference.trim()));
            return contains(id) ? Optional.of(id) : Optional.empty();
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
