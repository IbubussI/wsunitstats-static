import * as Constants from "utils/constants";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { TagBox } from "components/Atoms/TagBox";
import { useTranslation } from "react-i18next";

const HEAL_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '45%';
const FLEX_TABLE_LEFT_WIDTH = '55%';

export const HealTable = ({ heal, overflowMinWidth }) => {
  const { t } = useTranslation();
  const healData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('healHealDistanceCell'),
        value: heal.distance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('healHealSpeedCell'),
        value: heal.perSecond && heal.perSecond + t('hpSecMarker'),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('healSearchDistanceCell'),
        value: heal.searchNextDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('healAutoSearchDistanceCell'),
        value: heal.autoSearchTargetDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('healAutoSearchPeriodCell'),
        value: heal.autoSearchTargetPeriod && heal.autoSearchTargetPeriod + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const tagsData = {
    label: t('healTargetTags'),
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
