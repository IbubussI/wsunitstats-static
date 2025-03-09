import * as React from "react";
import { Stack, Typography } from "@mui/material";
import { ChartBox } from "components/Pages/ReplaysPage/ChartBox";
import { useTranslation } from "react-i18next";

export const PlayerChartViewer = ({ timeLine, timeLinePeriod, playerId }) => {
  const { t } = useTranslation();
  return (
    <Stack gap={1}>
      {timeLine.length !== 0 &&
        <ChartBox
          timeLine={timeLine}
          stepTime={timeLinePeriod}
          restrictByGroupName={'replayDatasetGroupPlayers'}
          restrictByDatasetIndex={playerId}
        />}
    </Stack>
  );
};
