package com.wsunitstats.exporter.content.entity;

import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityKind;
import com.wsunitstats.exporter.entity.EntityProvider;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeSet;

/**
 * Provider of entities the game identifies by path (e.g. units stored as content packs).
 * The identifiers are known from the content storage, so references can be resolved before the entities are read.
 * Identifiers are ordered by path.
 */
public class PathEntityProvider<T> implements EntityProvider<T> {
    private final EntityKind kind;
    private final Map<EntityId, T> entities = new HashMap<>();
    private final List<EntityId> ids;

    public PathEntityProvider(EntityKind kind, Collection<String> paths) {
        this.kind = kind;
        this.ids = new TreeSet<>(paths).stream().<EntityId>map(PathEntityId::new).toList();
        ids.forEach(id -> entities.put(id, null));
    }

    public void set(String path, T entity) {
        EntityId id = resolve(path);
        entities.put(id, entity);
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
        return entities.get(id);
    }

    @Override
    public boolean contains(EntityId id) {
        return entities.containsKey(id);
    }

    @Override
    public Optional<EntityId> find(String reference) {
        EntityId id = new PathEntityId(reference);
        return contains(id) ? Optional.of(id) : Optional.empty();
    }
}
