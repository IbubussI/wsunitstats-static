import * as React from "react";
import { Stack } from "@mui/material";
import { ChartBox } from "components/Pages/ReplaysPage/ChartBox";

export const PlayerChartViewer = ({ charts, timeLinePeriod, playerId }) => {
  return (
    <Stack gap={1}>
      {charts.length !== 0 &&
        <ChartBox
          timeLine={charts}
          stepTime={timeLinePeriod}
          restrictByGroupName={'replayDatasetGroupPlayers'}
          restrictByDatasetIndex={playerId}
        />}
    </Stack>
  );
};
