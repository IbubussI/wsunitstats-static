import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { HealTable } from "components/Pages/UnitPage/Tabs/Heal/HealTable";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const HealTab = ({ entity: unit }) => {
  return (
    <>
      <h3>Heal</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <HealTable heal={unit.heal} overflowMinWidth={OVERFLOW_WIDTH} />
        </GridGroup>
      </ResizableGrid>
    </>
  );
}