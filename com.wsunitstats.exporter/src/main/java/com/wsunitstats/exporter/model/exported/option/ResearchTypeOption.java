package com.wsunitstats.exporter.model.exported.option;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Objects;

@Getter
@Setter
@ToString
public class ResearchTypeOption implements Comparable<ResearchTypeOption> {
    private String name;
    private int id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ResearchTypeOption tagOption = (ResearchTypeOption) o;
        return id == tagOption.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public int compareTo(ResearchTypeOption other) {
        return Integer.compare(id, other.id);
    }
}
