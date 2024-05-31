import { ConstructionTable } from "components/Pages/UnitPage/Tabs/Constructions/ConstructionTable";
import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { Typography } from "@mui/material";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const ConstructionsTab = ({ entity: unit }) => {
  const Note = () => {
    return (
      <Typography variant="caption" color="text.secondary">
        * NOTE: Construction speed is now calculated with the use of some sort of "magic number", that was get empirically by measuring the time. Despite it has decent precision, it does not 100% correlate with in-game values. If you know the exact formula and want to share it with me, you can find my Discord below
      </Typography>
    );
  }

  return (
    <>
      <h3>Construction</h3>
      <ResizableGrid minWidth={MIN_WIDTH}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          {unit.construction.map((construction, index) => <ConstructionTable key={index} construction={construction} overflowMinWidth={OVERFLOW_WIDTH}/>)}
        </GridGroup>
        <GridGroup>
          <Note />
        </GridGroup>
      </ResizableGrid>
    </>
  );
}