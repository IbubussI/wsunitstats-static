import * as Constants from "utils/constants";
import * as Utils from "utils/utils";
import * as Data from "data";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip } from 'components/Atoms/Renderer';
import { useParams } from "react-router-dom";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { ClassicTable } from "components/Layout/ClassicTable";
import { useTranslation } from "react-i18next";

const ABILITY_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '67%';
const FLEX_TABLE_LEFT_WIDTH = '33%';

export const CreateUnitView = ({ ability, overflowMinWidth }) => {
  const { t } = useTranslation();
  const { locale } = useParams();
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
        label: t('abilitiesLifeTimeCell'),
        value: ability.lifeTime && ability.lifeTime + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(x => (x.childData.value || x.childData.value === 0) && (!x.childData.value.values || x.childData.value.values.length > 0));

  const requirementsData = ability.requirements && Data.getRequirementsData(ability.requirements, locale, t);

  const labelData = {
    value: {
      tooltip: t('abilitiesTooltipID', { value: ability.abilityId }),
      id: ability.abilityId,
      label: t(ability.abilityName),
      disabled: false
    },
    valueRenderer: HeaderChip,
    shift: '80px'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ width: '100%' }, null]} borderLabel={labelData} column>
      <FlexibleTable
        columns={ABILITY_COLUMNS}
        rows={abilityData.length}
        data={abilityData}
        rowHeight='max-content'
        minWidth={overflowMinWidth} />
      {requirementsData &&
        <InfoButtonPopper label={requirementsData.label}>
          {requirementsData.unitData.body && <ClassicTable data={requirementsData.unitData} />}
          {requirementsData.researchData.body && <ClassicTable data={requirementsData.researchData} />}
        </InfoButtonPopper>}
    </DoubleColumnFrame>
  );
}