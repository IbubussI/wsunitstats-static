import * as Constants from "utils/constants";
import { TagBox } from "components/Atoms/TagBox";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { SubValue } from "components/Atoms/Renderer";

const AIRPLANE_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '60%';
const FLEX_TABLE_LEFT_WIDTH = '40%';

export const AirplaneTable = ({ airplane, overflowMinWidth }) => {
  const airplaneData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: {
          primaryValue: 'Fuel',
          subValues: [{ value: '(fly time)' }]
        },
        labelRenderer: SubValue,
        value: airplane.fuel && airplane.fuel + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: {
          primaryValue: 'Reload period',
          subValues: [{ value: '(for 1 ammo)' }]
        },
        labelRenderer: SubValue,
        value: airplane.rechargePeriod && airplane.rechargePeriod + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Refuel speed',
        value: airplane.refuelSpeed && airplane.refuelSpeed + ' per sec',
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Heal speed',
        value: airplane.healingSpeed && airplane.healingSpeed + ' hp/sec',
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Ascension speed',
        value: airplane.ascensionSpeed,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Fly height',
        value: airplane.flyHeight,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Suicide attack',
        value: '' + !!airplane.kamikaze,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const tagsData = {
    label: 'Aerodrome tags: ',
    tags: airplane.aerodromeTags
  };

  return (
    <DoubleColumnFrame childrenProps={[null, null]} column>
      <FlexibleTable
        columns={AIRPLANE_COLUMNS}
        rows={airplaneData.length}
        data={airplaneData}
        minWidth={overflowMinWidth}
      />
      <TagBox tagsData={tagsData} />
    </DoubleColumnFrame>
  );
}