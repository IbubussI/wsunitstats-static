import * as Constants from "utils/constants";
import { SubValue } from "components/Atoms/Renderer";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { useTranslation } from "react-i18next";

const SUBMARINE_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '60%';
const FLEX_TABLE_LEFT_WIDTH = '40%';

export const SubmarineTable = ({ submarine, overflowMinWidth }) => {
  const { t } = useTranslation();
  const submarineData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('submarineUnderwaterTime'),
        value: submarine.underwaterTime && submarine.underwaterTime + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('submarineSwimDepthCell'),
        value: submarine.swimDepth,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('submarineAscensionSpeedCell'),
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
          primaryValue: t('submarineOnFuelEndCell'),
          subValues: [{ value: t('submarineOnFuelEndSubCell') }]
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