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
          primaryValue: t('airplaneFuelCell'),
          subValues: [{ value: t('airplaneFuelSubCell') }]
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
          primaryValue: t('airplaneReloadCell'),
          subValues: [{ value: t('airplaneReloadSubCell') }]
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
        label: t('airplaneRefuelSpeedCell'),
        value: airplane.refuelSpeed && airplane.refuelSpeed + t('perSecMarker'),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneHealCell'),
        value: airplane.healingSpeed && airplane.healingSpeed + t('hpSecMarker'),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneAscensionSpeedCell'),
        value: airplane.ascensionSpeed,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneHeightCell'),
        value: airplane.flyHeight,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('airplaneSuicideCell'),
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