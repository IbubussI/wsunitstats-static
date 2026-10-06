package com.wsunitstats.exporter.entity;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Resolves references to game entities kept by the exporter itself (constants, configuration).
 * Such references may become outdated when the game changes, so unknown ones are reported and skipped.
 */
public class EntityReferences {
    private static final Logger LOG = LogManager.getLogger(EntityReferences.class);

    private EntityReferences() {
        // Utility class
    }

    public static Set<EntityId> resolveAll(EntityProvider<?> provider, Collection<String> references) {
        Set<EntityId> result = new LinkedHashSet<>();
        references.forEach(reference -> find(provider, reference).ifPresent(result::add));
        return result;
    }

    public static <V> Map<EntityId, V> resolveKeys(EntityProvider<?> provider, Map<String, V> byReference) {
        Map<EntityId, V> result = new LinkedHashMap<>();
        byReference.forEach((reference, value) -> find(provider, reference).ifPresent(id -> result.put(id, value)));
        return result;
    }

    private static Optional<EntityId> find(EntityProvider<?> provider, String reference) {
        Optional<EntityId> id = provider.find(reference);
        if (id.isEmpty()) {
            LOG.warn("Exporter references {} [{}] which is absent in the game files", provider.getKind(), reference);
        }
        return id;
    }
}
