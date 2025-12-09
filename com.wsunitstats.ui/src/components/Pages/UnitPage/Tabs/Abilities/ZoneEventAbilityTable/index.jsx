import * as Constants from "utils/constants";
import * as Utils from "utils/utils";
import * as Data from "data";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { EntityInfo, HeaderChip } from "components/Atoms/Renderer";
import { ClassicTable } from "components/Layout/ClassicTable";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { TagBox } from "components/Atoms/TagBox";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DamageAbilitySubtable } from "../DamageAbilitySubtable";

const ABILITY_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '67%';
const FLEX_TABLE_LEFT_WIDTH = '33%';

export const ZoneEventAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { t } = useTranslation();
  const abilities = abilityContainer.abilities;

  const zoneEventData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('zoneAbilitySizeCell'),
        value: abilityContainer.size,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('zoneAbilityEnvSearchDistanceCell'),
        value: abilityContainer.envSearchDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
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
        <p>{t('triggerAbilitiesTitle')}</p>
        {abilities.map((ability, index) => (
          <Box key={index} sx={{ width: '100%' }}>
            {ability.abilityType === Constants.ABILITY_TYPE_DAMAGE
              ? <DamageAbilitySubtable ability={ability} overflowMinWidth={overflowMinWidth} />
              : <AbilitySubtable ability={ability} overflowMinWidth={overflowMinWidth} />
            }
          </Box>
        ))}
      </Stack>
    </DoubleColumnFrame>
  );
}

const AbilitySubtable = ({ ability, overflowMinWidth }) => {
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
            {requirementsData.researchAnyData.body && <ClassicTable data={requirementsData.researchAnyData} />}
            {requirementsData.researchAllData.body && <ClassicTable data={requirementsData.researchAllData} />}
          </InfoButtonPopper>}
      </>
    </DoubleColumnFrame>
  );
}
