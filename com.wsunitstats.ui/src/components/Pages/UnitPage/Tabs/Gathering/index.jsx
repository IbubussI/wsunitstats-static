import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { GatheringTable } from "components/Pages/UnitPage/Tabs/Gathering/GatheringTable";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const GatheringTab = ({ entity: unit }) => {
  return (
    <>
      <h3>Gathering</h3>
      <ResizableGrid minWidth={MIN_WIDTH}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          {unit.gather.map((gatherEntry, index) => <GatheringTable key={index} gather={gatherEntry} overflowMinWidth={OVERFLOW_WIDTH}/>)}
        </GridGroup>
      </ResizableGrid>
    </>
  );
}