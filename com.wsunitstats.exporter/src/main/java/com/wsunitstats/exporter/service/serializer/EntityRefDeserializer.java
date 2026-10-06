package com.wsunitstats.exporter.service.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.wsunitstats.exporter.entity.EntityId;
import com.wsunitstats.exporter.entity.EntityKind;
import com.wsunitstats.exporter.entity.EntityProvider;

import java.io.IOException;
import java.util.Optional;

/**
 * Resolves a reference to a game entity, as the game files hold it (an index, a path, ...), to the entity identifier.
 * Resolution is done by the provider of the entity kind, taken from the reader attribute keyed by the kind.
 */
public abstract class EntityRefDeserializer extends JsonDeserializer<EntityId> {
    private final EntityKind kind;

    protected EntityRefDeserializer(EntityKind kind) {
        this.kind = kind;
    }

    @Override
    public EntityId deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String reference = parser.getValueAsString();
        EntityProvider<?> provider = (EntityProvider<?>) context.getAttribute(kind);
        if (provider == null) {
            return context.reportInputMismatch(this, "No %s provider to resolve [%s]", kind, reference);
        }
        Optional<EntityId> id = provider.find(reference);
        if (id.isEmpty()) {
            return context.reportInputMismatch(this, "Unknown %s reference: [%s]", kind, reference);
        }
        return id.get();
    }

    public static class Unit extends EntityRefDeserializer {
        public Unit() {
            super(EntityKind.UNIT);
        }
    }

    public static class Env extends EntityRefDeserializer {
        public Env() {
            super(EntityKind.ENV);
        }
    }

    public static class Projectile extends EntityRefDeserializer {
        public Projectile() {
            super(EntityKind.PROJECTILE);
        }
    }

    public static class Research extends EntityRefDeserializer {
        public Research() {
            super(EntityKind.RESEARCH);
        }
    }

    public static class Upgrade extends EntityRefDeserializer {
        public Upgrade() {
            super(EntityKind.UPGRADE);
        }
    }
}
