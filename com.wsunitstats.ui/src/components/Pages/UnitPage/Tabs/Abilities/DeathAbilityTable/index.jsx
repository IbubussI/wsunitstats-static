import { FlexibleTable } from "components/Layout/FlexibleTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { HeaderChip } from "components/Atoms/Renderer";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { useParams } from "react-router-dom";
import { getBuffData, getDamageData, getDamagesData, getEnvData } from "data";
import { DoubleColumnTable } from "components/Layout/DoubleColumnTable";
import { Stack } from "@mui/material";

const COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '52%';
const FLEX_TABLE_LEFT_WIDTH = '48%';

export const DeathAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { locale } = useParams();
  const ability = abilityContainer.ability;
  const attacksNumber = ability.damage.damagesCount;
  const damagesData = getDamagesData(ability.damage.damages, attacksNumber);
  const buffData = getBuffData(ability.damage.buff, locale);
  const envData = getEnvData(ability.damage);
  const damageData = getDamageData(ability.damage, FLEX_TABLE_RIGHT_WIDTH, FLEX_TABLE_LEFT_WIDTH);

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
      {damagesData.content.length &&
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
      {!damagesData.content.length &&
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
        columns={COLUMNS}
        rows={damageData.length}
        data={damageData}
        minWidth={overflowMinWidth}
        rowHeight='max-content' />
    </DoubleColumnFrame>
  );
}