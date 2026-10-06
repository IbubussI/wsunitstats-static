package com.wsunitstats.exporter.lua;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Reconstructs the values a Lua source chunk assigns to named places (globals, locals and table fields)
 * without running it, producing the same values as {@link LuaTableExtractor} does for compiled chunks.
 * <p>
 * Every {@code name = value} found in the source is evaluated if the value is a literal: a string, a number,
 * a boolean, {@code nil}, a table constructor or a call of a named function with literal arguments
 * (e.g. {@code localize("<*ageNames/0>")}). Everything else becomes {@link LuaTableExtractor#UNKNOWN}.
 */
public class LuaSourceReader {
    private static final Set<String> CONTINUATION_TOKENS = Set.of(
            "..", "+", "-", "*", "/", "//", "%", "^", "==", "~=", "<", ">", "<=", ">=",
            "and", "or", ".", "[", ":", "&", "|", "~", "<<", ">>");
    private static final Set<String> BLOCK_OPENERS = Set.of("function", "do", "if", "repeat");
    private static final Set<String> BLOCK_CLOSERS = Set.of("end", "until");

    private final List<Token> tokens;
    private int pos;

    private LuaSourceReader(String source) {
        this.tokens = new LuaLexer(source).tokenize();
    }

    /**
     * @return values assigned by the chunk to named places, by name. If a name is assigned
     * several times the last assignment wins.
     */
    public static Map<String, Object> extractNamedValues(String source) {
        return new LuaSourceReader(source).extract();
    }

    private Map<String, Object> extract() {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int i = 0; i + 1 < tokens.size(); ++i) {
            Token token = tokens.get(i);
            if (token.type == TokenType.NAME && tokens.get(i + 1).is("=")) {
                pos = i + 2;
                Object value = parseValue();
                if (value != LuaTableExtractor.UNKNOWN && isContinued()) {
                    value = LuaTableExtractor.UNKNOWN;
                }
                result.put(token.text, value);
            }
        }
        return result;
    }

    /**
     * Parses a literal value at the current position. On failure the position is left somewhere
     * inside the expression, so callers inside table constructors must skip to the next field.
     */
    private Object parseValue() {
        Token token = peek();
        switch (token.type) {
            case STRING:
                pos++;
                return token.value;
            case NUMBER:
                pos++;
                return token.value;
            case SYMBOL:
                if (token.is("{")) {
                    return parseTable();
                }
                if (token.is("-") && peek(1).type == TokenType.NUMBER) {
                    pos += 2;
                    Object number = peek(-1).value;
                    return number instanceof Long l ? (Object) (-l) : (Object) (-(Double) number);
                }
                return LuaTableExtractor.UNKNOWN;
            case NAME:
                switch (token.text) {
                    case "true":
                        pos++;
                        return Boolean.TRUE;
                    case "false":
                        pos++;
                        return Boolean.FALSE;
                    case "nil":
                        pos++;
                        return null;
                    default:
                        return parseCall();
                }
            default:
                return LuaTableExtractor.UNKNOWN;
        }
    }

    private Object parseCall() {
        String functionName = peek().text;
        Token next = peek(1);
        if (next.type == TokenType.STRING || next.is("{")) {
            // f"string" and f{table} call forms
            pos++;
            Object argument = parseValue();
            return argument == LuaTableExtractor.UNKNOWN ? argument : new LuaFunctionCall(functionName, List.of(argument));
        }
        if (!next.is("(")) {
            // a reference to another variable
            return LuaTableExtractor.UNKNOWN;
        }
        pos += 2;
        List<Object> arguments = new ArrayList<>();
        if (peek().is(")")) {
            pos++;
            return new LuaFunctionCall(functionName, arguments);
        }
        while (true) {
            Object argument = parseValue();
            if (argument == LuaTableExtractor.UNKNOWN || isContinued()) {
                return LuaTableExtractor.UNKNOWN;
            }
            arguments.add(argument);
            if (peek().is(",")) {
                pos++;
            } else if (peek().is(")")) {
                pos++;
                return new LuaFunctionCall(functionName, arguments);
            } else {
                return LuaTableExtractor.UNKNOWN;
            }
        }
    }

    private Object parseTable() {
        pos++; // {
        LuaTable table = new LuaTable();
        long arrayIndex = 1;
        while (true) {
            Token token = peek();
            if (token.type == TokenType.EOF) {
                return LuaTableExtractor.UNKNOWN;
            }
            if (token.is("}")) {
                pos++;
                return table;
            }

            Object key;
            if (token.is("[")) {
                pos++;
                key = parseValue();
                if (key == null || key == LuaTableExtractor.UNKNOWN || !peek().is("]") || !peek(1).is("=")) {
                    skipField();
                    continue;
                }
                pos += 2;
            } else if (token.type == TokenType.NAME && peek(1).is("=")) {
                key = token.text;
                pos += 2;
            } else {
                key = arrayIndex++;
            }

            Object value = parseValue();
            if (value == LuaTableExtractor.UNKNOWN || isContinued()) {
                value = LuaTableExtractor.UNKNOWN;
                skipField();
            }
            table.put(key instanceof Double d && d == Math.rint(d) ? (Object) d.longValue() : key, value);

            if (peek().is(",") || peek().is(";")) {
                pos++;
            } else if (!peek().is("}")) {
                skipField();
            }
        }
    }

    /**
     * Skips the rest of the current table field: up to the next separator or the end of the table
     * at the current nesting level
     */
    private void skipField() {
        int depth = 0;
        while (peek().type != TokenType.EOF) {
            Token token = peek();
            if (depth == 0 && (token.is(",") || token.is(";") || token.is("}"))) {
                return;
            }
            if (token.is("{") || token.is("(") || token.is("[") || token.isKeyword(BLOCK_OPENERS)) {
                depth++;
            } else if (token.is("}") || token.is(")") || token.is("]") || token.isKeyword(BLOCK_CLOSERS)) {
                depth--;
            }
            pos++;
        }
    }

    /**
     * @return true if the value just parsed is only the first operand of a larger expression
     */
    private boolean isContinued() {
        Token token = peek();
        return (token.type == TokenType.SYMBOL || token.type == TokenType.NAME) && CONTINUATION_TOKENS.contains(token.text);
    }

    private Token peek() {
        return peek(0);
    }

    private Token peek(int offset) {
        int index = pos + offset;
        return index < tokens.size() ? tokens.get(index) : tokens.get(tokens.size() - 1);
    }

    private enum TokenType {
        NAME, NUMBER, STRING, SYMBOL, EOF
    }

    private record Token(TokenType type, String text, Object value) {
        boolean is(String symbol) {
            return type == TokenType.SYMBOL && text.equals(symbol);
        }

        boolean isKeyword(Set<String> keywords) {
            return type == TokenType.NAME && keywords.contains(text);
        }
    }

    private static class LuaLexer {
        private static final String[] SYMBOLS = {
                "...", "..", "==", "~=", "<=", ">=", "//", "::", "<<", ">>",
                "+", "-", "*", "/", "%", "^", "#", "&", "~", "|", "<", ">", "=",
                "(", ")", "{", "}", "[", "]", ";", ":", ",", "."
        };

        private final String source;
        private int pos;

        LuaLexer(String source) {
            // skip a BOM and a shebang line if any
            String text = source.startsWith("﻿") ? source.substring(1) : source;
            if (text.startsWith("#")) {
                int lineEnd = text.indexOf('\n');
                text = lineEnd < 0 ? "" : text.substring(lineEnd);
            }
            this.source = text;
        }

        List<Token> tokenize() {
            List<Token> result = new ArrayList<>();
            while (true) {
                skipWhitespaceAndComments();
                if (pos >= source.length()) {
                    result.add(new Token(TokenType.EOF, "", null));
                    return result;
                }
                result.add(nextToken());
            }
        }

        private Token nextToken() {
            char ch = source.charAt(pos);
            if (Character.isLetter(ch) || ch == '_') {
                int start = pos;
                while (pos < source.length() && (Character.isLetterOrDigit(source.charAt(pos)) || source.charAt(pos) == '_')) {
                    pos++;
                }
                return new Token(TokenType.NAME, source.substring(start, pos), null);
            }
            if (Character.isDigit(ch) || (ch == '.' && pos + 1 < source.length() && Character.isDigit(source.charAt(pos + 1)))) {
                return readNumber();
            }
            if (ch == '"' || ch == '\'') {
                return readQuotedString(ch);
            }
            if (ch == '[') {
                int level = longBracketLevel(pos);
                if (level >= 0) {
                    String text = readLongBracket(level);
                    return new Token(TokenType.STRING, text, text);
                }
            }
            for (String symbol : SYMBOLS) {
                if (source.startsWith(symbol, pos)) {
                    pos += symbol.length();
                    return new Token(TokenType.SYMBOL, symbol, null);
                }
            }
            throw new IllegalArgumentException("Unexpected character '" + ch + "' at position " + pos);
        }

        private Token readNumber() {
            int start = pos;
            boolean hex = source.startsWith("0x", pos) || source.startsWith("0X", pos);
            if (hex) {
                pos += 2;
            }
            while (pos < source.length()) {
                char ch = source.charAt(pos);
                boolean exponent = hex ? (ch == 'p' || ch == 'P') : (ch == 'e' || ch == 'E');
                if (exponent && pos + 1 < source.length() && (source.charAt(pos + 1) == '+' || source.charAt(pos + 1) == '-')) {
                    pos += 2;
                } else if (Character.isLetterOrDigit(ch) || ch == '.') {
                    pos++;
                } else {
                    break;
                }
            }
            String text = source.substring(start, pos);
            Object value;
            if (hex) {
                value = text.contains(".") || text.contains("p") || text.contains("P")
                        ? (Object) Double.parseDouble(text)
                        : (Object) Long.parseUnsignedLong(text.substring(2), 16);
            } else if (text.contains(".") || text.contains("e") || text.contains("E")) {
                value = Double.parseDouble(text);
            } else {
                value = Long.parseLong(text);
            }
            return new Token(TokenType.NUMBER, text, value);
        }

        private Token readQuotedString(char quote) {
            StringBuilder builder = new StringBuilder();
            pos++;
            while (pos < source.length()) {
                char ch = source.charAt(pos++);
                if (ch == quote) {
                    String text = builder.toString();
                    return new Token(TokenType.STRING, text, text);
                }
                if (ch != '\\') {
                    builder.append(ch);
                    continue;
                }
                char escape = source.charAt(pos++);
                switch (escape) {
                    case 'n' -> builder.append('\n');
                    case 't' -> builder.append('\t');
                    case 'r' -> builder.append('\r');
                    case 'a' -> builder.append('\u0007');
                    case 'b' -> builder.append('\b');
                    case 'f' -> builder.append('\f');
                    case 'v' -> builder.append('\u000B');
                    case '\n' -> builder.append('\n');
                    case 'x' -> {
                        builder.append((char) Integer.parseInt(source.substring(pos, pos + 2), 16));
                        pos += 2;
                    }
                    case 'z' -> {
                        while (pos < source.length() && Character.isWhitespace(source.charAt(pos))) {
                            pos++;
                        }
                    }
                    case 'u' -> {
                        int end = source.indexOf('}', pos);
                        builder.appendCodePoint(Integer.parseInt(source.substring(pos + 1, end), 16));
                        pos = end + 1;
                    }
                    default -> {
                        if (Character.isDigit(escape)) {
                            int start = pos - 1;
                            while (pos < source.length() && pos - start < 3 && Character.isDigit(source.charAt(pos))) {
                                pos++;
                            }
                            builder.append((char) Integer.parseInt(source.substring(start, pos)));
                        } else {
                            builder.append(escape);
                        }
                    }
                }
            }
            throw new IllegalArgumentException("Unfinished string");
        }

        /**
         * @return level of a long bracket ([[, [=[, [==[ ...) opening at the given position, or -1 if there is none
         */
        private int longBracketLevel(int at) {
            if (at >= source.length() || source.charAt(at) != '[') {
                return -1;
            }
            int index = at + 1;
            int level = 0;
            while (index < source.length() && source.charAt(index) == '=') {
                level++;
                index++;
            }
            return index < source.length() && source.charAt(index) == '[' ? level : -1;
        }

        private String readLongBracket(int level) {
            String close = "]" + "=".repeat(level) + "]";
            int start = pos + level + 2;
            int end = source.indexOf(close, start);
            if (end < 0) {
                throw new IllegalArgumentException("Unfinished long bracket");
            }
            pos = end + close.length();
            // a newline right after the opening bracket is not part of the string
            if (source.startsWith("\r\n", start)) {
                start += 2;
            } else if (start < source.length() && source.charAt(start) == '\n') {
                start++;
            }
            return source.substring(start, end);
        }

        private void skipWhitespaceAndComments() {
            while (pos < source.length()) {
                char ch = source.charAt(pos);
                if (Character.isWhitespace(ch)) {
                    pos++;
                } else if (source.startsWith("--", pos)) {
                    pos += 2;
                    int level = longBracketLevel(pos);
                    if (level >= 0) {
                        readLongBracket(level);
                    } else {
                        while (pos < source.length() && source.charAt(pos) != '\n') {
                            pos++;
                        }
                    }
                } else {
                    return;
                }
            }
        }
    }
}
