import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { BuildingTable } from "components/Pages/UnitPage/Tabs/Building/BuildingTable";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 450;

export const BuildingTab = ({ entity: unit }) => {
  return (
    <>
      <h3>Building</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <BuildingTable build={unit.build} overflowMinWidth={OVERFLOW_WIDTH}/>
        </GridGroup>
      </ResizableGrid>
    </>
  );
}