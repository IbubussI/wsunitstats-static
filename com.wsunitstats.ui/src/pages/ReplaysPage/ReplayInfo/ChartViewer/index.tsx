import * as React from "react";
import { Button, Stack } from "@mui/material";
import { ChartBox } from '@/pages/ReplaysPage/ChartBox';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import type { ChartMarkerProvider } from '@/pages/ReplaysPage/ReplayInfo/transferMarkers';

const maxCharts = 15;
const minCharts = 1;
/** @param charts the time line charts of the replay and the ones made of the additional replay data */
export const ChartViewer = ({ id, charts, timeLinePeriod, markerProvider }: {
  id: string;
  charts: ReplayParseResult['timeLine'];
  timeLinePeriod: number;
  markerProvider?: ChartMarkerProvider;
}) => {
  const [boxNum, setBoxNum] = React.useState(1);

  return (
    <Stack gap={1}>
      {Array.from({ length: boxNum }, (_, i) =>
        <ChartBox key={i} id={`${id}-${i}`}
          timeLine={charts}
          stepTime={timeLinePeriod}
          markerProvider={markerProvider}
        />)}
      <Stack gap={1} direction="row" sx={{ justifyContent: 'center' }}>
        <Button variant="contained" onClick={() => setBoxNum(Math.min(boxNum + 1, maxCharts))}>
          <AddIcon />
        </Button>
        <Button variant="contained" onClick={() => setBoxNum(Math.max(boxNum - 1, minCharts))}>
          <RemoveIcon />
        </Button>
      </Stack>
    </Stack>
  );
};
