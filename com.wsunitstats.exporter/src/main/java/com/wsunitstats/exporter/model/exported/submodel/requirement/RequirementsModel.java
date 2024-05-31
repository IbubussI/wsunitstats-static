package com.wsunitstats.exporter.model.exported.submodel.requirement;

import com.wsunitstats.exporter.utils.Utils;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Objects;

@Getter
@Setter
@ToString
public class RequirementsModel {
    private List<UnitRequirementModel> units;
    private List<ResearchRequirementModel> researches;
    private Boolean researchesAll;
    private Boolean unitsAll;

    /**
     * Returns true if objects are equals (as standard) but also returns true
     * if given other object is null or contains only 'empty' fields (nulls or empty collections).
     * It is required because RequirementsModel is nullable and repository returns empty List instead of null
     * It is used by CUSTOM include type of Jackson as follows:
     * new RequirementsModel().equals(_object to check if it is empty_)
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return true;
        if (getClass() != o.getClass()) return false;
        RequirementsModel that = (RequirementsModel) o;
        return Utils.equalsNullable(units, that.units)
               && Utils.equalsNullable(researches, that.researches)
               && Objects.equals(researchesAll, that.researchesAll)
               && Objects.equals(unitsAll, that.unitsAll);
    }

    @Override
    public int hashCode() {
        return Objects.hash(units, researches, researchesAll, unitsAll);
    }
}
