import * as React from "react";
import { Button, Stack } from "@mui/material";
import { ChartBox } from "components/Pages/ReplaysPage/ChartBox";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const maxCharts = 15;
const minCharts = 1;
export const ChartViewer = ({ id, replayInfo }) => {
  const [boxNum, setBoxNum] = React.useState(1);
  const [chartBoxes, setChartBoxes] = React.useState(() =>
    [<ChartBox key={0} id={`${id}-${0}`}
      timeLine={replayInfo.timeLine}
      stepTime={replayInfo.timeLinePeriod}
    />]);

  React.useEffect(() => {
    const newBoxes = [];
    for (let i = 0; i < boxNum; i++) {
      newBoxes.push(<ChartBox key={i} id={`${id}-${boxNum}`}
        timeLine={replayInfo.timeLine}
        stepTime={replayInfo.timeLinePeriod}
      />);
    }
    setChartBoxes(newBoxes);
  }, [boxNum, id, replayInfo]);

  return (
    <Stack gap={1}>
      {[...chartBoxes]}
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
