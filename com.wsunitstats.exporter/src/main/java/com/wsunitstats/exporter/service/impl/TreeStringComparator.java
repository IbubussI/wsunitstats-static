package com.wsunitstats.exporter.service.impl;

import java.util.Comparator;
import java.util.regex.Pattern;

public class TreeStringComparator implements Comparator<String> {
    private static final Pattern DIGITS_PATTERN = Pattern.compile("\\d+");

    @Override
    public int compare(String o1, String o2) {
        boolean b1 = DIGITS_PATTERN.matcher(o1).matches();
        boolean b2 = DIGITS_PATTERN.matcher(o2).matches();
        if (b1 && b2) {
            return Integer.parseInt(o1) - Integer.parseInt(o2);
        } else if (b1) {
            return 1;
        } else if (b2) {
            return -1;
        } else {
            return o1.compareTo(o2);
        }
    }
}
