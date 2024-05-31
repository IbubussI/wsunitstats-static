import * as Data from "data";
import * as Constants from "utils/constants";
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { ClassicTable } from "components/Layout/ClassicTable";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { Resource } from "components/Atoms/Renderer";
import { useParams } from "react-router-dom";

const BUILD_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '65%';
const FLEX_TABLE_LEFT_WIDTH = '35%';

export const BuildingTable = ({ build, overflowMinWidth }) => {
  const { locale } = useParams();

  const buildData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Full cost',
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
        label: 'Init cost',
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
        label: 'Heal cost',
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
        label: 'Income value',
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
        label: 'Income period',
        value: build.income?.period && build.income.period + Constants.SECONDS_END_MARKER,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Init health',
        value: build.initHealth,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Build ID',
        value: build.buildId,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const requirementsData = build.requirements && Data.getRequirementsData(build.requirements, locale);

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
          {requirementsData.researchData.body && <ClassicTable data={requirementsData.researchData} />}
        </InfoButtonPopper>}
    </DoubleColumnFrame>
  );
}