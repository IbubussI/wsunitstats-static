import { Stack } from "@mui/material";
import { ChartBox } from '@/pages/ReplaysPage/ChartBox';
import type { ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

interface PlayerChartViewerProps {
  charts: ReplayParseResult['timeLine'];
  timeLinePeriod: number;
  playerId: number;
}

export const PlayerChartViewer = ({ charts, timeLinePeriod, playerId }: PlayerChartViewerProps) => {
  return (
    <Stack gap={1}>
      {charts.length !== 0 &&
        <ChartBox
          id={`player-${playerId}`}
          timeLine={charts}
          stepTime={timeLinePeriod}
          restrictByGroupName={'replayDatasetGroupPlayers'}
          restrictByDatasetIndex={playerId}
        />}
    </Stack>
  );
};
