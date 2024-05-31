package com.wsunitstats.exporter.service.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.util.Map;

public class IndexedArrayDataModelSerializer extends JsonSerializer<Map<Integer, Object>> {
    @Override
    public void serialize(Map<Integer, Object> value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartArray();
        for(Map.Entry<Integer, Object> entry : value.entrySet()) {
            gen.writeStartArray();
            gen.writeNumber(entry.getKey());
            serializers.defaultSerializeValue(entry.getValue(), gen);
            gen.writeEndArray();
        }
        gen.writeEndArray();
    }
}
