import * as Constants from "utils/constants";
import * as Utils from "utils/utils";
import * as Data from "data";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip } from 'components/Atoms/Renderer';
import { DoubleColumnTable } from "components/Layout/DoubleColumnTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { ClassicTable } from "components/Layout/ClassicTable";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

const ABILITY_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '67%';
const FLEX_TABLE_LEFT_WIDTH = '33%';

export const WorkAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { t } = useTranslation();
  const ability = abilityContainer.ability;
  const work = abilityContainer.work;
  const abilityData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesTargetCell'),
        value: ability.entityInfo && {
          primary: t(ability.entityInfo.entityName),
          secondary: ability.entityInfo.entityNation && Utils.localizeNation(t, ability.entityInfo.entityNation.name),
          image: {
            path: ability.entityInfo.entityImage,
            width: 35,
            height: 35,
          },
          link: {
            id: ability.entityInfo.entityId,
            path: Utils.getAbilityRoute(ability.abilityType)
          },
          overflow: true
        },
        valueRenderer: EntityInfo,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('workAbilityWeaponCell'),
        value: ability.weapon,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('workAbilityMakeTimeCell'),
        value: work.makeTime && work.makeTime + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('workAbilityReserveLimitCell'),
        value: work.reserve?.reserveLimit,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('workAbilityReserveTimeCell'),
        value: work.reserve && work.reserve.reserveTime + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesCountCell'),
        value: ability.count,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesDurationCell'),
        value: ability.duration && ability.duration + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesLifeTimeCell'),
        value: ability.lifeTime && ability.lifeTime + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('workAbilityWorkIdCell'),
        value: work.workId,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(x => x.childData.value != null);

  const requirementsData = ability.requirements && Data.getRequirementsData(ability.requirements, t);

  const costTableData = {
    label: t('workAbilityCostLabel'),
    variant: 'resource',
    width: '150px',
    rowStyle: {
      leftRowWidth: 'max-content',
      rightRowWidth: '71px',
      firstRowPaddingTop: '5px',
      paddingTop: '0px',
      paddingBottom: '0px'
    },
    content: work.cost,
  }

  const disabled = work.enabled === false && 'disabled';
  const labelData = {
    value: {
      tooltip: t('abilitiesTooltipID', { value: ability.abilityId }),
      id: ability.abilityId,
      label: t(ability.abilityName),
      disabled: disabled
    },
    valueRenderer: HeaderChip,
    shift: '80px'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px' }, { overflow: 'auto', width: '100%' }]} borderLabel={labelData} disabled={disabled}>
      <>
        <DoubleColumnTable data={costTableData} />
        <Stack sx={{
          width: '100%',
          gap: '5px',
          padding: '5px',
          boxSizing: 'border-box'
        }}>
          {requirementsData &&
            <InfoButtonPopper label={requirementsData.label}>
              {requirementsData.unitData.body && <ClassicTable data={requirementsData.unitData} />}
              {requirementsData.researchAnyData.body && <ClassicTable data={requirementsData.researchAnyData} />}
              {requirementsData.researchAllData.body && <ClassicTable data={requirementsData.researchAllData} />}
            </InfoButtonPopper>}
        </Stack>
      </>
      <FlexibleTable
        columns={ABILITY_COLUMNS}
        rows={abilityData.length}
        data={abilityData}
        rowHeight='max-content'
        minWidth={overflowMinWidth} />
    </DoubleColumnFrame>
  );
}
