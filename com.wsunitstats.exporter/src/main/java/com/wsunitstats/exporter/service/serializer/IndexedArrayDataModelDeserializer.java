package com.wsunitstats.exporter.service.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.io.InvalidObjectException;
import java.util.HashMap;
import java.util.Map;

public abstract class IndexedArrayDataModelDeserializer<T> extends JsonDeserializer<Map<Integer, T>> {
    protected abstract Class<T> getValueClass();

    @Override
    public Map<Integer, T> deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        Map<Integer, T> dataModelMap = new HashMap<>();
        ObjectCodec codec = parser.getCodec();
        JsonNode node = codec.readTree(parser);
        if (node.isArray()) {
            for (JsonNode arrayElement : node) {
                JsonNode idNode = arrayElement.get(0);
                JsonNode dataNode = arrayElement.get(1);

                if (dataNode.isNull()) {
                    dataModelMap.put(idNode.asInt(), null);
                    continue;
                }

                if (!idNode.isInt() || !dataNode.isObject()) {
                    throw new InvalidObjectException("Expected next format [ id, {data} ] where id is INT and data is OBJECT");
                }

                T dataModel;
                JavaType modelType = context.getTypeFactory().constructType(getValueClass());
                JsonDeserializer<?> deserializer = context.findRootValueDeserializer(modelType);
                JsonParser modelParser = dataNode.traverse(codec);
                modelParser.nextToken();
                dataModel = (T) deserializer.deserialize(modelParser, context);

                dataModelMap.put(idNode.asInt(), dataModel);
            }
        }
        return dataModelMap;
    }
}
