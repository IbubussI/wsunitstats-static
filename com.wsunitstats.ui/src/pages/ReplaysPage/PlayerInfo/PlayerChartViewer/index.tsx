import { Stack } from "@mui/material";
import { ChartBox } from '@/pages/ReplaysPage/ChartBox';
import type { ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import type { ChartMarkerProvider } from '@/pages/ReplaysPage/ReplayInfo/transferMarkers';

interface PlayerChartViewerProps {
  charts: ReplayParseResult['timeLine'];
  timeLinePeriod: number;
  playerId: number;
  markerProvider?: ChartMarkerProvider;
}

export const PlayerChartViewer = ({ charts, timeLinePeriod, playerId, markerProvider }: PlayerChartViewerProps) => {
  return (
    <Stack gap={1}>
      {charts.length !== 0 &&
        <ChartBox
          id={`player-${playerId}`}
          timeLine={charts}
          stepTime={timeLinePeriod}
          restrictByGroupName={'replayDatasetGroupPlayers'}
          restrictByPlayerId={playerId}
          markerProvider={markerProvider}
        />}
    </Stack>
  );
};
