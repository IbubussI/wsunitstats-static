import * as React from "react";
import { Stack } from "@mui/material";
import { ChartBox } from "components/Pages/ReplaysPage/ChartBox";

export const ChartViewer = ({ replayInfo }) => {
  return (
    <Stack gap={1}>
      {replayInfo.timeLine.length !== 0 &&
        <ChartBox
          timeLine={replayInfo.timeLine}
          stepTime={replayInfo.timeLinePeriod}
        />}
    </Stack>
  );
};
