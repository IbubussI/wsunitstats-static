import * as Constants from "utils/constants";
import * as Utils from "utils/utils";
import * as Data from "data";
import { Box, Stack } from "@mui/material";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip, SubValue } from 'components/Atoms/Renderer';
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { ClassicTable } from "components/Layout/ClassicTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { useTranslation } from "react-i18next";
import { DamageAbilitySubtable } from "../DamageAbilitySubtable";

const ABILITY_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '67%';
const FLEX_TABLE_LEFT_WIDTH = '33%';

export const OnActionAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { t } = useTranslation();
  const actionData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponRangeCell'),
        value: abilityContainer.distance && {
          primaryValue: abilityContainer.distance.min ? abilityContainer.distance.min + '...' + abilityContainer.distance.max : abilityContainer.distance.max,
          subValues: [
            {
              label: t('weaponRangeCellStop'),
              value: abilityContainer.distance.stop
            }
          ]
        },
        valueRenderer: SubValue,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('onActionAbilityActionAgroCell'),
        value: t('' + abilityContainer.onAgro),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('onActionAbilityActionRechargeCell'),
        value: abilityContainer.rechargeTime && abilityContainer.rechargeTime + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    }
  ].filter(x => x.childData.value);

  const disabled = abilityContainer.enabled === false && 'disabled';

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px' }, { width: '100%', padding: '20px' }]} disabled={disabled} column>
      <FlexibleTable
        columns={ABILITY_COLUMNS}
        rows={actionData.length}
        data={actionData}
        rowHeight='max-content' />
      <Stack alignItems='center' spacing={3}>
        <p>{t('triggerAbilitiesTitle')}</p>
        {abilityContainer.abilities.map((ability, index) => (
          <Box key={index} sx={{ width: '100%' }}>
            {ability.abilityType === Constants.ABILITY_TYPE_DAMAGE
              ? <DamageAbilitySubtable ability={ability} overflowMinWidth={overflowMinWidth} disabled={disabled}/>
              : <AbilitySubtable ability={ability} overflowMinWidth={overflowMinWidth} disabled={disabled}/>
            }
          </Box>
        ))}
      </Stack>
    </DoubleColumnFrame>
  );
}

const AbilitySubtable = ({ ability, overflowMinWidth, disabled }) => {
  const { t } = useTranslation();
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
    }
  ].filter(x => x.childData.value != null);

  const requirementsData = ability.requirements && Data.getRequirementsData(ability.requirements, t);

  const labelData = {
    value: {
      tooltip: t('abilitiesTooltipID', { value: ability.abilityId }),
      id: ability.abilityId,
      label: t(ability.abilityName),
      disabled: disabled,
      disabledLabel: true
    },
    valueRenderer: HeaderChip,
    shift: '90px'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px' }, { overflow: 'auto', width: '100%' }]} borderLabel={labelData} disabled={disabled}>
      <>
        <FlexibleTable
          columns={ABILITY_COLUMNS}
          rows={abilityData.length}
          data={abilityData}
          rowHeight='max-content'
          minWidth={overflowMinWidth} />
        {requirementsData &&
          <InfoButtonPopper label={requirementsData.label}>
            {requirementsData.unitData.body && <ClassicTable data={requirementsData.unitData} />}
            {requirementsData.researchAnyData.body && <ClassicTable data={requirementsData.researchAnyData} />}
            {requirementsData.researchAllData.body && <ClassicTable data={requirementsData.researchAllData} />}
          </InfoButtonPopper>}
      </>
    </DoubleColumnFrame>
  );
}
