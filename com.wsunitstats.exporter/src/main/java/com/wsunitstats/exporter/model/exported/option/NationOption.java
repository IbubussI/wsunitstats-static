package com.wsunitstats.exporter.model.exported.option;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Objects;

@Getter
@Setter
@ToString
public class NationOption implements Comparable<NationOption> {
    private String name;
    private int gameId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NationOption that = (NationOption) o;
        return gameId == that.gameId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(gameId);
    }

    @Override
    public int compareTo(NationOption other) {
        return Integer.compare(gameId, other.gameId);
    }
}
