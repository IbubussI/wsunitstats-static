import * as Data from "data";
import { FlexibleTable } from "components/Layout/FlexibleTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { HeaderChip } from "components/Atoms/Renderer";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { useParams } from "react-router-dom";
import { DoubleColumnTable } from "components/Layout/DoubleColumnTable";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

const COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '52%';
const FLEX_TABLE_LEFT_WIDTH = '48%';

export const DeathAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const ability = abilityContainer.ability;
  const attacksNumber = ability.damage.damagesCount;
  const damagesData = Data.getDamagesData(ability.damage.damages, attacksNumber, t);
  const buffData =  Data.getBuffData(ability.damage.buff, locale, t);
  const envData =  Data.getEnvData(ability.damage, t);
  const damageData =  Data.getDamageData(ability.damage, FLEX_TABLE_RIGHT_WIDTH, FLEX_TABLE_LEFT_WIDTH, t);

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
      {damagesData.content.length &&
        <>
          <DoubleColumnTable data={damagesData} />
          <Stack sx={{
            width: '100%',
            gap: '5px',
            padding: '5px',
            boxSizing: 'border-box'
          }}>
          {buffData.content?.length > 0 &&
            <InfoButtonPopper label={buffData.label}>
              <DoubleColumnTable data={buffData} />
            </InfoButtonPopper>}
          {envData.content.length > 0 &&
            <InfoButtonPopper label={envData.label}>
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
        </Stack>}

      <FlexibleTable
        columns={COLUMNS}
        rows={damageData.length}
        data={damageData}
        minWidth={overflowMinWidth}
        rowHeight='max-content' />
    </DoubleColumnFrame>
  );
};