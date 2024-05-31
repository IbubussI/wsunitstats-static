import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { AirplaneTable } from "components/Pages/UnitPage/Tabs/Airplane/AirplaneTable";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 450;

export const AirplaneTab = ({ entity: unit }) => {
  return (
    <>
      <h3>Airplane</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <AirplaneTable airplane={unit.airplane} overflowMinWidth={OVERFLOW_WIDTH}/>
        </GridGroup>
      </ResizableGrid>
    </>
  );
}