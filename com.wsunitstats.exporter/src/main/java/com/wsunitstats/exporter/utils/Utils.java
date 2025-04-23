package com.wsunitstats.exporter.utils;

import com.wsunitstats.exporter.model.NationName;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.UnaryOperator;
import java.util.regex.Matcher;

import static com.wsunitstats.exporter.utils.Constants.LOCALIZATION_MAP_ENTRY_PATTERN;
import static com.wsunitstats.exporter.utils.Constants.LOCALIZATION_PATTERN;

public class Utils {
    private static final Logger LOG = LoggerFactory.getLogger(Utils.class);

    private Utils() {
        //Utility class
    }

    public static Double intToDoubleShift(Integer value) {
        return divide(value, Constants.SHIFT_VALUE_MULTIPLIER);
    }

    public static Double doubleToDoubleShift(Double value) {
        return divide(value, Constants.SHIFT_VALUE_MULTIPLIER);
    }

    public static Double intToDoubleTick(Integer value) {
        return divide(value, Constants.TICK_TIME);
    }

    public static Double longToDoubleSpeed(Long value) {
        return divide(value, Constants.PROJECTILE_SPEED_VALUE_MULTIPLIER);
    }

    public static Double intToPercent(Integer value) {
        return divide(value, Constants.PERCENT_VALUE_MULTIPLIER);
    }

    public static Double intToSupply(Integer value) {
        return divide(value, Constants.POPULATION_VALUE_MULTIPLIER);
    }

    public static int sum(List<Integer> list) {
        return list.stream()
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
    }

    public static Double intToConstructionSpeed(Integer progress) {
        /*
         * time = (hp-initial_hp)*progress/tickRate, s (not used here, JFI)
         * speed = 1/progress*tickRate, %/sec
         */
        if (progress == null) {
            return null;
        }
        return Utils.intToDoubleShift(progress) * Constants.BUILD_SPEED_MODIFIER;
    }

    public static List<Integer> add(List<Integer> intList1, List<Integer> intList2) {
        if (intList1.size() != intList2.size()) {
            throw new IllegalArgumentException("Given lists should be the same size");
        }
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < intList1.size(); ++i) {
            result.add(intList1.get(i) + intList2.get(i));
        }
        return result;
    }

    /**
     * Check if two lists are equal. Default equals behavior except
     * if one of lists is null and other is empty it returns true instead of false.
     */
    public static boolean equalsNullable(List<?> list1, List<?> list2) {
        if (list1 != null) {
            if (list2 != null) {
                return Objects.equals(list1, list2);
            } else {
                return list1.isEmpty();
            }
        } else {
            if (list2 != null) {
                return list2.isEmpty();
            } else {
                return true;
            }
        }
    }

    /**
     * Replaces all occurrences of localization pattern in given input string
     * with value, returned by given localization function.
     * Removes all curly braces from localized values.
     *
     * @param input                string to be localized
     * @param localizationFunction function to get localization value by key, found in given input
     * @return localized string
     */
    public static String localizeAll(String input, UnaryOperator<String> localizationFunction) {
        Matcher matcher = Constants.LOCALIZATION_KEY_PATTERN.matcher(input);
        StringBuilder output = new StringBuilder();
        while (matcher.find()) {
            String localized = localizationFunction.apply(matcher.group());
            matcher.appendReplacement(output, localized);
        }
        matcher.appendTail(output);
        return output.toString();
    }

    /**
     * Removes all curly braces (both left and right) from given input string
     */
    public static String clearCurlyBraces(String input) {
        return input.replaceAll("[{}]", StringUtils.EMPTY);
    }

    public static List<Integer> getPositiveBitIndices(long bits) {
        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < Constants.LONG_SIZE; ++i) {
            if ((bits & 1L << i) != 0) {
                indices.add(i);
            }
        }
        return indices;
    }

    /**
     * Converts list of next format: {[0]=localize("<*sample_tag/0>"), ...} to map where key - env id, value - localization key
     */
    public static Map<Integer, String> convertToLocalizationTagMap(List<String> list) {
        Map<Integer, String> result = new HashMap<>();
        list.forEach(item -> {
            Matcher matcher = LOCALIZATION_MAP_ENTRY_PATTERN.matcher(item);
            if (matcher.find()) {
                result.put(Integer.parseInt(matcher.group(1)), matcher.group(2));
            }
        });
        return result;
    }

    /**
     * Converts localize("<*sample_tag/10>") to <*sample_tag/10>
     */
    public static List<String> convertToLocalizationTags(List<String> values) {
        List<String> result = new ArrayList<>();
        values.forEach(value -> result.add(convertToLocalizationTag(value)));
        return result;
    }

    /**
     * Converts localize("<*sample_tag/10>") to <*sample_tag/10>
     */
    public static String convertToLocalizationTag(String value) {
        Matcher matcher = LOCALIZATION_PATTERN.matcher(value);
        if (matcher.find()) {
            return matcher.group(1);
        }
        LOG.error("Value {} does not match pattern {}", value, LOCALIZATION_PATTERN);
        throw new IllegalStateException("Localization Tag expected");
    }

    public static List<NationName> convertToNationNames(List<String> rawNationNames) {
        List<NationName> result = new ArrayList<>();
        for (int i = 0; i < rawNationNames.size(); ++i) {
            String ir1 = rawNationNames.get(i);
            String ir2 = null;
            if (ir1.contains("{")) {
                ++i;
                ir2 = rawNationNames.get(i);
            }

            NationName nationName = new NationName();
            nationName.setIr1(convertToLocalizationTag(ir1));
            if (ir2 != null) {
                nationName.setIr2(convertToLocalizationTag(ir2));
            }
            result.add(nationName);
        }
        return result;
    }

    /**
     * Returns given boolean or false if it is not present
     */
    public static boolean getDirectBoolean(Boolean bool) {
        return Boolean.TRUE.equals(bool);
    }

    /**
     * Returns given boolean or true if it is not present
     */
    public static boolean getInvertedBoolean(Boolean bool) {
        return bool == null || Boolean.TRUE.equals(bool);
    }

    /**
     * Rounds given double value to closest neighbor that have specified number of digits at decimal portion
     *
     * @param value to be rounded
     * @param places numbers behind the dot
     * @return rounded double
     */
    public static double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();

        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    /**
     * Returns a sum of 2 resource lists
     */
    public static List<ResourceModel> addResources(List<ResourceModel> first, List<ResourceModel> second) {
        if (first == null) {
            return second;
        }
        if (second == null) {
            return first;
        }
        if (first.size() != second.size()) {
            throw new IllegalArgumentException("Resource arrays should be the same size.");
        }

        List<ResourceModel> result = new ArrayList<>();
        for (int i = 0; i < first.size(); i++) {
            ResourceModel res = new ResourceModel();
            res.setValue(first.get(i).getValue() + second.get(i).getValue());
            res.setResourceId(first.get(i).getResourceId());
            res.setResourceName(first.get(i).getResourceName());
            res.setImage(first.get(i).getImage());
            result.add(res);
        }
        return result;
    }

    private static Double divide(Integer value, double divider) {
        if (value == null) {
            return null;
        }
        return value / divider;
    }

    private static Double divide(Long value, double divider) {
        if (value == null) {
            return null;
        }
        return value / divider;
    }

    private static Double divide(Double value, double divider) {
        if (value == null) {
            return null;
        }
        return value / divider;
    }
}
