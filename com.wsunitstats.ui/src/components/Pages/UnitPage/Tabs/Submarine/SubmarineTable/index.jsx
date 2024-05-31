import * as Constants from "utils/constants";
import { SubValue } from "components/Atoms/Renderer";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";

const SUBMARINE_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '60%';
const FLEX_TABLE_LEFT_WIDTH = '40%';

export const SubmarineTable = ({ submarine, overflowMinWidth }) => {
  const submarineData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Underwater time',
        value: submarine.underwaterTime && submarine.underwaterTime + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Swim depth',
        value: submarine.swimDepth,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Ascension speed',
        value: submarine.ascensionSpeed,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: {
          primaryValue: 'Ability on fuel end',
          subValues: [{ value: '(ability ID)' }]
        },
        labelRenderer: SubValue,
        value: submarine.abilityOnFuelEnd,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  return (
    <DoubleColumnFrame childrenProps={[null, null]} column>
      <FlexibleTable
        columns={SUBMARINE_COLUMNS}
        rows={submarineData.length}
        data={submarineData}
        minWidth={overflowMinWidth}
      />
    </DoubleColumnFrame>
  );
}