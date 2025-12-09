import * as Data from "data";
import * as Constants from "utils/constants";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { ClassicTable } from "components/Layout/ClassicTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { Resource } from "components/Atoms/Renderer";
import { useTranslation } from "react-i18next";

const BUILD_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '65%';
const FLEX_TABLE_LEFT_WIDTH = '35%';

export const BuildingTable = ({ build, overflowMinWidth }) => {
  const { t } = useTranslation();

  const buildData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('buildFullCostCell'),
        value: build.fullCost,
        valueRenderer: Resource,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('buildInitCostCell'),
        value: build.initCost,
        valueRenderer: Resource,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('buildHealCostCell'),
        value: build.healCost,
        valueRenderer: Resource,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('buildIncomeValueCell'),
        value: build.income?.value,
        valueRenderer: Resource,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('buildIncomePeriodCell'),
        value: build.income?.period && build.income.period + t(Constants.SECONDS_END_MARKER),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('buildInitHealthCell'),
        value: build.initHealth,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('buildBuildIdCell'),
        value: build.buildId,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value != null);

  const requirementsData = build.requirements && Data.getRequirementsData(build.requirements, t);

  return (
    <DoubleColumnFrame childrenProps={[ { width: '100%' }, null ]} column>
      <FlexibleTable
        columns={BUILD_COLUMNS}
        rows={buildData.length}
        data={buildData}
        minWidth={overflowMinWidth}
      />
      {requirementsData &&
        <InfoButtonPopper label={requirementsData.label}>
          {requirementsData.unitData.body && <ClassicTable data={requirementsData.unitData} />}
          {requirementsData.researchAnyData.body && <ClassicTable data={requirementsData.researchAnyData} />}
          {requirementsData.researchAllData.body && <ClassicTable data={requirementsData.researchAllData} />}
        </InfoButtonPopper>}
    </DoubleColumnFrame>
  );
}
