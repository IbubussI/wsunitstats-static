import * as Constants from "utils/constants";
import { TagBox } from "components/Atoms/TagBox";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { SubValue } from "components/Atoms/Renderer";
import { useTranslation } from "react-i18next";

const AIRPLANE_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '60%';
const FLEX_TABLE_LEFT_WIDTH = '40%';

export const AirplaneTable = ({ airplane, overflowMinWidth }) => {
  const { t } = useTranslation();
  const airplaneData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: {
          primaryValue: t('airplaneFuel'),
          subValues: [{ value: t('airplaneFuelSub') }]
        },
        labelRenderer: SubValue,
        value: airplane.fuel && airplane.fuel + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: {
          primaryValue: t('airplaneReload'),
          subValues: [{ value: t('airplaneReloadSub') }]
        },
        labelRenderer: SubValue,
        value: airplane.rechargePeriod && airplane.rechargePeriod + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneRefuelSpeed'),
        value: airplane.refuelSpeed && airplane.refuelSpeed + t('perSecMarker'),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('Heal speed'),
        value: airplane.healingSpeed && airplane.healingSpeed + t('hpSecMarker'),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneAscensionSpeed'),
        value: airplane.ascensionSpeed,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneHeight'),
        value: airplane.flyHeight,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneSuicide'),
        value: t('' + !!airplane.kamikaze),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const tagsData = {
    label: t('airplaneAerodromeTagsTitle'),
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