import * as React from 'react';
import * as Constants from "utils/constants";
import { FlexibleTable, FlexibleTableDoubleCellRow } from 'components/Layout/FlexibleTable';
import { Stack, Typography } from '@mui/material';
import { DoubleColumnFrame } from 'components/Layout/DoubleColumnFrame';
import { ArmorChart } from 'components/Pages/UnitPage/Tabs/Common/ArmorChart';
import { TagBox } from 'components/Atoms/TagBox';
import { EntityImage } from 'components/Atoms/EntityImage';

const COMMON_COLUMN = 1;
const FLEX_TABLE_RIGHT_WIDTH = '50%';
const FLEX_TABLE_LEFT_WIDTH = '50%';

export const CommonTable = ({ unit, overflowMinWidth }) => {
  const commonData = [
    createRowData('Game ID', unit.gameId),
    createRowData('Nation', unit.nation.name),
    createRowData('Health', unit.health),
    createRowData('View Range', unit.viewRange),
    createRowData('Size', unit.size),
    createRowData('Regeneration Speed', unit.regenerationSpeed, 'hp/sec'),

    createRowData('Movement Speed', unit.movement?.speed),
    createRowData('Rotation Speed', unit.movement?.rotationSpeed),

    createRowData('Transporting size', unit.transporting?.ownSize),
    createRowData('Transporting capacity', unit.transporting?.carrySize),
    createRowData('Can transport', unit.transporting?.carrySize ? (unit.transporting.onlyInfantry ? 'Only infantry' : 'Any land unit') : null),

    createRowData('Takes population', unit.supply?.consume),
    createRowData('Gives population', unit.supply?.produce),
    createRowData('Limit', unit.limit),

    createRowData(`Receives friendly${Constants.JS_NBSP}dmg`, '' + !!unit.receiveFriendlyDamage),
    createRowData('Parent must not move', unit.parentMustIdle ? '' + true : null),
    createRowData('Controllable', '' + !!unit.controllable),

    createRowData('Storage efficiency', unit.storageMultiplier && unit.storageMultiplier + '%'),

    createRowData('Threat', unit.threat),
    createRowData('Weight', unit.weight),
    createRowData('Death weapon', typeof unit.weaponOnDeath === 'number' ? ('W' + unit.weaponOnDeath) : null),
  ].filter(element => element);

  const searchTagsData = {
    label: 'Search tags:',
    tags: unit.searchTags
  };

  const tagsData = {
    label: 'Unit tags:',
    tags: unit.tags
  };

  return (
    <Stack spacing={0.5}>
      <DoubleColumnFrame childrenProps={[null, { overflow: 'auto', width: '100%' }]}>
        <Stack alignItems='center'>
          <h3 style={{ marginBlockStart: '0.4em', marginBlockEnd: '0.65em', maxWidth: '150px', textAlign: 'center' }}>{unit.name}</h3>
          <EntityImage image={unit.image} width='150px' height='150px'/>
          <Typography variant='body2' align='center' sx={{maxWidth: '150px'}}>
            {unit.description}
          </Typography>
          {unit.armor?.length > 0 &&
            <>
              <h3>Armor</h3>
              <ArmorChart
                content={unit.armor}
                valuePrefix={'Thickness: '}
                colors={[
                  'rgba(122, 16, 16, 1)',
                  'rgba(168, 87, 15, 1)',
                  'rgba(168, 116, 15, 1)',
                  'rgba(15, 132, 21, 1)',
                ]} />
            </>}
        </Stack>
        <FlexibleTable
          columns={COMMON_COLUMN}
          rows={commonData.length}
          data={commonData}
          rowHeight='max-content'
          minWidth={overflowMinWidth} />
      </DoubleColumnFrame>
      <DoubleColumnFrame childrenProps={[]} column>
        <>
          <TagBox tagsData={searchTagsData} />
          <TagBox tagsData={tagsData} />
        </>
      </DoubleColumnFrame>
    </Stack>
  );
}

function createRowData(name, valueObject, units) {
  if (valueObject != null) {
    let value = "";
    if (units) {
      value = `${valueObject} ${units}`;
    } else {
      value = valueObject.toString();
    }
    return {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: name,
        value: value,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    };
  } else {
    return null;
  }
}