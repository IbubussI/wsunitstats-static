package com.wsunitstats.exporter.content;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Iterator;
import java.util.Map;

/**
 * Applies the unit overrides the project files hold for content entities: objects are merged recursively,
 * any other value (arrays included) replaces the overridden one, null removes it (RFC 7386 semantics)
 */
public class JsonMergePatch {
    private JsonMergePatch() {
        // Utility class
    }

    /**
     * @return patched copy of the target. The arguments are not modified.
     */
    public static JsonNode apply(JsonNode target, JsonNode patch) {
        if (patch == null || patch.isMissingNode()) {
            return target;
        }
        if (!patch.isObject()) {
            return patch.deepCopy();
        }
        ObjectNode result = target != null && target.isObject()
                ? ((ObjectNode) target).deepCopy()
                : JsonNodeFactory.instance.objectNode();
        Iterator<Map.Entry<String, JsonNode>> fields = patch.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            if (field.getValue().isNull()) {
                result.remove(field.getKey());
            } else {
                result.set(field.getKey(), apply(result.get(field.getKey()), field.getValue()));
            }
        }
        return result;
    }
}
