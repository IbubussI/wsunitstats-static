import * as Constants from "utils/constants";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { TagBox } from "components/Atoms/TagBox";

const HEAL_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '45%';
const FLEX_TABLE_LEFT_WIDTH = '55%';

export const HealTable = ({ heal, overflowMinWidth }) => {
  const healData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Healing distance',
        value: heal.distance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Healing speed',
        value: heal.perSecond && heal.perSecond + ' hp/sec',
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Search next distance',
        value: heal.searchNextDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Auto search target distance',
        value: heal.autoSearchTargetDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Auto search target period',
        value: heal.autoSearchTargetPeriod && heal.autoSearchTargetPeriod + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const tagsData = {
    label: 'Target tags: ',
    tags: heal.targetTags
  };

  return (
    <DoubleColumnFrame childrenProps={[null, null]} column>
      <FlexibleTable
        columns={HEAL_COLUMNS}
        rows={healData.length}
        data={healData}
        minWidth={overflowMinWidth}
      />
      <TagBox tagsData={tagsData} />
    </DoubleColumnFrame>
  );
}

