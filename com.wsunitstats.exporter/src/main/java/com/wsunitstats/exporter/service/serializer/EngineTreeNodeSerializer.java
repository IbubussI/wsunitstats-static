package com.wsunitstats.exporter.service.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.wsunitstats.exporter.service.impl.EngineTreeNode;

import java.io.IOException;

public class EngineTreeNodeSerializer extends StdSerializer<EngineTreeNode> {
    public EngineTreeNodeSerializer(Class<EngineTreeNode> t) {
        super(t);
    }

    @Override
    public void serialize(EngineTreeNode value, JsonGenerator gen, SerializerProvider serializers)
            throws IOException {
        gen.writeStartObject();
        gen.writeStringField("id", value.getEnginePath());
        gen.writeStringField("lb", value.getLabel());
        if (value.isExpanded()) {
            gen.writeBooleanField("ex", true);
        }

        boolean isAsync = value.isAsync();
        if (isAsync) {
            gen.writeBooleanField("as", true);
        }
        if (value.getChildren() != null && !isAsync) {
            gen.writeArrayFieldStart("ch");
            for (EngineTreeNode child : value.getChildren()) {
                gen.writeObject(child);
            }
            gen.writeEndArray();
        }
        gen.writeStringField("cb", value.getContextBatch());
        gen.writeEndObject();
    }
}
