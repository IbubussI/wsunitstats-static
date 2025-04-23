import * as React from "react";
import { Button, Stack } from "@mui/material";
import { ChartBox } from "components/Pages/ReplaysPage/ChartBox";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const maxCharts = 15;
const minCharts = 1;
export const ChartViewer = ({ id, replayInfo }) => {
  const [boxNum, setBoxNum] = React.useState(1);
  const [chartBoxes] = React.useState(() =>
    [<ChartBox key={0} id={`${id}-${0}`}
      timeLine={replayInfo.timeLine}
      stepTime={replayInfo.timeLinePeriod}
    />]);

  return (
    <Stack gap={1}>
      {[...chartBoxes]}
      <Stack gap={1} direction="row" sx={{ justifyContent: 'center' }}>
        <Button variant="contained" onClick={() => {
          const currBoxNum = Math.min(boxNum + 1, maxCharts);
          if (currBoxNum > boxNum) {
            chartBoxes.push(<ChartBox key={boxNum} id={`${id}-${boxNum}`}
              timeLine={replayInfo.timeLine}
              stepTime={replayInfo.timeLinePeriod}
            />);
          }
          setBoxNum(currBoxNum);
        }}>
          <AddIcon />
        </Button>
        <Button variant="contained" onClick={() => {
          const currBoxNum = Math.max(boxNum - 1, minCharts);
          if (currBoxNum < boxNum) {
            chartBoxes.pop();
          }
          setBoxNum(currBoxNum);
        }}>
          <RemoveIcon />
        </Button>
      </Stack>
    </Stack>
  );
};
