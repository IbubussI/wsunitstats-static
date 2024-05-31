import * as Constants from "utils/constants";
import * as Utils from "utils/utils";
import * as Data from "data";
import { Stack } from "@mui/material";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip, SubValue, Text } from 'components/Atoms/Renderer';
import { DoubleColumnTable } from "components/Layout/DoubleColumnTable";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { useParams } from "react-router-dom";
import { ClassicTable } from "components/Layout/ClassicTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";

const ABILITY_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '67%';
const FLEX_TABLE_LEFT_WIDTH = '33%';

export const OnActionAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { locale } = useParams();
  const ability = abilityContainer.ability;
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
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Count',
        value: ability.count,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Duration',
        value: ability.duration && ability.duration + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Life time',
        value: ability.lifeTime && ability.lifeTime + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    }
  ].filter(x => x.childData.value && (!x.childData.value.values || x.childData.value.values.length > 0));

  
  const actionData = {
    label: 'Action data',
    variant: 'popper',
    tableLayout: 'fixed',
    width: 'max-content',
    rowStyle: {
      firstRowPaddingTop: '10px',
      paddingTop: '4px',
      paddingBottom: '4px'
    },
    content: [
      {
        label: 'Distance',
        renderer: SubValue,
        value: {
          primaryValue: abilityContainer.distance.min ? abilityContainer.distance.min + '...' + abilityContainer.distance.max : abilityContainer.distance.max,
          subValues: [
            {
              label: 'stop',
              value: abilityContainer.distance.stop
            }
          ]
        },
      },
      {
        label: 'On agro',
        renderer: Text,
        value: '' + abilityContainer.onAgro,
      },
      {
        label: 'Recharge Time',
        renderer: Text,
        value: abilityContainer.rechargeTime && abilityContainer.rechargeTime + Constants.SECONDS_END_MARKER,
      },
    ].filter(element => element.value !== undefined)
  }

  const requirementsData = ability.requirements && Data.getRequirementsData(ability.requirements, locale);

  const disabled = abilityContainer.enabled === false && 'disabled';
  const labelData = {
    value: {
      tooltip: "Ability ID #" + ability.abilityId,
      id: ability.abilityId,
      label: ability.abilityName,
      disabled: disabled,
      disabledLabel: true
    },
    valueRenderer: HeaderChip,
    shift: '90px'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px'}, { overflow: 'auto', width: '100%' }]} borderLabel={labelData} disabled={disabled}>
      <>
        <DoubleColumnTable data={actionData} />
        <Stack sx={{
          width: '100%',
          gap: '5px',
          padding: '5px',
          boxSizing: 'border-box'
        }}>
          {requirementsData &&
            <InfoButtonPopper label={requirementsData.label}>
              {requirementsData.unitData.body && <ClassicTable data={requirementsData.unitData} />}
              {requirementsData.researchData.body && <ClassicTable data={requirementsData.researchData} />}
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

