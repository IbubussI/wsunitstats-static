import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { WorkAbilityTable } from "components/Pages/UnitPage/Tabs/Abilities/WorkAbilityTable"
import { OnActionAbilityTable } from "components/Pages/UnitPage/Tabs/Abilities/OnActionAbilityTable";
import { ZoneEventAbilityTable } from "components/Pages/UnitPage/Tabs/Abilities/ZoneEventAbilityTable";
import { DeathAbilityTable } from "components/Pages/UnitPage/Tabs/Abilities/DeathAbilityTable";

const MIN_WIDTH = 280;
const COLUMN_WIDTH = 480;

export const AbilitiesTab = ({ entity: unit }) => {
  const onActionAbilities = unit.abilities.filter(element => element.containerType === 0);
  const workAbilities = unit.abilities.filter(element => element.containerType === 1);
  const zoneEventAbilities = unit.abilities.filter(element => element.containerType === 2);
  const deathAbilities = unit.abilities.filter(element => element.containerType === 3);

  return (
    <>
      <h3>Abilities</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={0}>
        <GridGroup heading={workAbilities[0]?.containerName} columnWidth={COLUMN_WIDTH}>
          {getTables(WorkAbilityTable, workAbilities)}
        </GridGroup>
        <GridGroup heading={onActionAbilities[0]?.containerName} columnWidth={COLUMN_WIDTH}>
          {getTables(OnActionAbilityTable, onActionAbilities)}
        </GridGroup>
        <GridGroup heading={zoneEventAbilities[0]?.containerName} columnWidth={COLUMN_WIDTH}>
          {getTables(ZoneEventAbilityTable, zoneEventAbilities)}
        </GridGroup>
        <GridGroup heading={deathAbilities[0]?.containerName} columnWidth={COLUMN_WIDTH}>
          {getTables(DeathAbilityTable, deathAbilities)}
        </GridGroup>
      </ResizableGrid>
    </>
  );
}

const getTables = (AbilityComponent, abilities) => {
  if (abilities.length) {
    return abilities.map((abilityContainer, index) =>
      <AbilityComponent key={index} abilityContainer={abilityContainer} overflowMinWidth={MIN_WIDTH} />
    );
  } else {
    return null;
  }
}