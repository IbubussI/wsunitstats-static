import * as React from "react";
import { Button, Stack } from "@mui/material";
import { ChartBox } from "components/Pages/ReplaysPage/ChartBox";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const maxCharts = 15;
const minCharts = 1;
export const ChartViewer = ({ replayInfo }) => {
  const [boxNum, setBoxNum] = React.useState(1);

  if (replayInfo.timeLine.charts.length !== 0) {
    const chartBoxes = [];
    for (let i = 0; i < boxNum; i++) {
      chartBoxes.push(<ChartBox key={i}
        timeLine={replayInfo.timeLine.charts}
        stepTime={replayInfo.timeLinePeriod}
      />);
    }
    return (
      <Stack gap={1}>
        {chartBoxes}
        <Stack gap={1} direction="row" sx={{ justifyContent: 'center'}}>
          <Button variant="contained" onClick={() => setBoxNum(Math.min(boxNum + 1, maxCharts))}>
            <AddIcon />
          </Button>
          <Button variant="contained" onClick={() => setBoxNum(Math.max(boxNum - 1, minCharts))}>
            <RemoveIcon />
          </Button>
        </Stack>
      </Stack>
    );
  } else {
    return null;
  }
};
