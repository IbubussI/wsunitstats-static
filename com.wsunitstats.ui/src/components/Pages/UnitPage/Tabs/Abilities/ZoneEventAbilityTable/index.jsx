import * as Constants from "utils/constants";
import * as Utils from "utils/utils";
import * as Data from "data";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { EntityInfo, HeaderChip } from "components/Atoms/Renderer";
import { ClassicTable } from "components/Layout/ClassicTable";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { TagBox } from "components/Atoms/TagBox";
import { useParams } from "react-router-dom";
import { DoubleColumnTable } from "components/Layout/DoubleColumnTable";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

const ABILITY_COLUMNS = 1;
const DAMAGE_COLUMNS = 1;
const FLEX_TABLE_ABILITY_RIGHT_WIDTH = '67%';
const FLEX_TABLE_ABILITY_LEFT_WIDTH = '33%';
const FLEX_TABLE_DAMAGE_RIGHT_WIDTH = '52%';
const FLEX_TABLE_DAMAGE_LEFT_WIDTH = '48%';

export const ZoneEventAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const abilities = abilityContainer.abilities;

  const zoneEventData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('zoneAbilitySizeCell'),
        value: abilityContainer.size,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('zoneAbilityEnvSearchDistanceCell'),
        value: abilityContainer.envSearchDistance,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    }
  ].filter(x => x.childData.value);

  const searchTagsData = {
    label: t('tagContainerEnv'),
    tags: abilityContainer.envTags
  };

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px' }, { width: '100%', padding: '20px'}]} column>
      <>
        <FlexibleTable
          columns={ABILITY_COLUMNS}
          rows={zoneEventData.length}
          data={zoneEventData}
          rowHeight='max-content' />
        <TagBox tagsData={searchTagsData} />
      </>
      <Stack alignItems='center' spacing={3}>
        <p>{t('zoneAbilityAssociatedAbilitiesTitle')}</p>
        {abilities.map((ability, index) => {
          return (
            <Box key={index} sx={{ width: '100%' }}>
              {ability.abilityType === Constants.ABILITY_TYPE_DAMAGE
                ? <DamageAbilitySubtable ability={ability} locale={locale} overflowMinWidth={overflowMinWidth} />
                : <AbilitySubtable ability={ability} locale={locale} overflowMinWidth={overflowMinWidth} />
              }
            </Box>
          )
        })}
      </Stack>
    </DoubleColumnFrame>
  );
}

const AbilitySubtable = ({ ability, locale, overflowMinWidth }) => {
  const { t } = useTranslation();
  const abilityData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesTargetCell'),
        value: {
          values: [
            ability.entityInfo && {
              primary: t(ability.entityInfo.entityName),
              secondary: ability.entityInfo.entityNation && Utils.localizeNation(t, ability.entityInfo.entityNation.name),
              image: {
                path: ability.entityInfo.entityImage,
                width: 35,
                height: 35,
              },
              link: {
                id: ability.entityInfo.entityId,
                locale: locale,
                path: Utils.getAbilityRoute(ability.abilityType)
              },
              overflow: true
            },
          ].filter(element => element),
        },
        valueRenderer: EntityInfo,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesCountCell'),
        value: ability.count,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesDurationCell'),
        value: ability.duration && ability.duration + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('abilitiesLifeTimeCell'),
        value: ability.lifeTime && ability.lifeTime + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    }
  ].filter(x => x.childData.value && (!x.childData.value.values || x.childData.value.values.length > 0));

  const requirementsData = ability.requirements && Data.getRequirementsData(ability.requirements, locale, t);

  const labelData = {
    value: {
      tooltip: t('abilitiesTooltipID', { value: ability.abilityId }),
      id: ability.abilityId,
      label: t(ability.abilityName),
      disabled: false
    },
    valueRenderer: HeaderChip,
    shift: '95px'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px' }, { width: '100%' }]} borderLabel={labelData} >
      <>
        <FlexibleTable
          columns={ABILITY_COLUMNS}
          rows={abilityData.length}
          data={abilityData}
          overflowMinWidth={overflowMinWidth}
          rowHeight='max-content' />
        {requirementsData &&
          <InfoButtonPopper label={requirementsData.label}>
            {requirementsData.unitData.body && <ClassicTable data={requirementsData.unitData} />}
            {requirementsData.researchData.body && <ClassicTable data={requirementsData.researchData} />}
          </InfoButtonPopper>}
      </>
    </DoubleColumnFrame>
  );
}

const DamageAbilitySubtable = ({ ability, locale, overflowMinWidth }) => {
  const { t } = useTranslation();
  const attacksNumber = ability.damage.damagesCount;
  const damagesData = Data.getDamagesData(ability.damage.damages, attacksNumber, t);
  const buffData = Data.getBuffData(ability.damage.buff, locale, t);
  const envData = Data.getEnvData(ability.damage, t);
  const damageData = Data.getDamageData(ability.damage, FLEX_TABLE_DAMAGE_RIGHT_WIDTH, FLEX_TABLE_DAMAGE_LEFT_WIDTH, t);

  const labelData = {
    value: {
      tooltip: t('abilitiesTooltipID', { value: ability.abilityId }),
      id: ability.abilityId,
      label: t(ability.abilityName),
      disabled: false
    },
    valueRenderer: HeaderChip,
    shift: '95px'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px' }, { overflow: 'auto', width: '100%' }]} borderLabel={labelData}>
      {damagesData.length &&
        <>
          <DoubleColumnTable data={damagesData} />
          <Stack sx={{
            width: '100%',
            gap: '5px',
            padding: '5px',
            boxSizing: 'border-box'
          }}>
            {buffData.content?.length > 0 && <InfoButtonPopper label={buffData.label}>
              <DoubleColumnTable data={buffData} />
            </InfoButtonPopper>}
            {envData.content.length > 0 && <InfoButtonPopper label={envData.label}>
              <DoubleColumnTable data={envData} />
            </InfoButtonPopper>}
          </Stack>
        </>
      }
      {!damagesData.length &&
        <Stack sx={{
          width: '100%',
          gap: '5px',
          padding: '5px',
          boxSizing: 'border-box'
        }}>
          {buffData.content?.length > 0 && <DoubleColumnTable data={buffData} />}
          {envData.content.length > 0 && <DoubleColumnTable data={envData} />}
        </Stack>
      }

      <FlexibleTable
        columns={DAMAGE_COLUMNS}
        rows={damageData.length}
        data={damageData}
        minWidth={overflowMinWidth}
        rowHeight='max-content' />
    </DoubleColumnFrame>
  )
}