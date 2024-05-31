import * as Constants from "utils/constants";
import * as Utils from "utils/utils";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { EntityInfo, HeaderChip } from "components/Atoms/Renderer";
import { ClassicTable } from "components/Layout/ClassicTable";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { TagBox } from "components/Atoms/TagBox";
import { useParams } from "react-router-dom";
import { getBuffData, getDamageData, getDamagesData, getEnvData, getRequirementsData } from "data";
import { DoubleColumnTable } from "components/Layout/DoubleColumnTable";
import { Box, Stack } from "@mui/material";

const ABILITY_COLUMNS = 1;
const DAMAGE_COLUMNS = 1;
const FLEX_TABLE_ABILITY_RIGHT_WIDTH = '67%';
const FLEX_TABLE_ABILITY_LEFT_WIDTH = '33%';
const FLEX_TABLE_DAMAGE_RIGHT_WIDTH = '52%';
const FLEX_TABLE_DAMAGE_LEFT_WIDTH = '48%';

export const ZoneEventAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { locale } = useParams();
  const abilities = abilityContainer.abilities;

  const zoneEventData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Size',
        value: abilityContainer.size,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Env search distance',
        value: abilityContainer.envSearchDistance,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    }
  ].filter(x => x.childData.value);

  const searchTagsData = {
    label: 'Env tags:',
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
        <p>Associated Abilities</p>
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
  const abilityData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Target',
        value: {
          values: [
            ability.entityInfo && {
              primary: ability.entityInfo.entityName,
              secondary: ability.entityInfo.entityNation && ability.entityInfo.entityNation.name,
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
        label: 'Count',
        value: ability.count,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Duration',
        value: ability.duration && ability.duration + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Life time',
        value: ability.lifeTime && ability.lifeTime + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_ABILITY_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_ABILITY_LEFT_WIDTH
      }
    }
  ].filter(x => x.childData.value && (!x.childData.value.values || x.childData.value.values.length > 0));

  const requirementsData = ability.requirements && getRequirementsData(ability.requirements, locale);

  const labelData = {
    value: {
      tooltip: "Ability ID #" + ability.abilityId,
      id: ability.abilityId,
      label: ability.abilityName,
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
  const attacksNumber = ability.damage.damagesCount;
  const damagesData = getDamagesData(ability.damage.damages, attacksNumber);
  const buffData = getBuffData(ability.damage.buff, locale);
  const envData = getEnvData(ability.damage);
  const damageData = getDamageData(ability.damage, FLEX_TABLE_DAMAGE_RIGHT_WIDTH, FLEX_TABLE_DAMAGE_LEFT_WIDTH);

  const labelData = {
    value: {
      tooltip: "Ability ID #" + ability.abilityId,
      id: ability.abilityId,
      label: ability.abilityName,
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