import * as Utils from "utils/utils";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip } from "components/Atoms/Renderer";
import { useParams } from "react-router-dom";

const BUILD_COLUMNS = 1;
const FLEX_TABLE_RIGHT_WIDTH = '65%';
const FLEX_TABLE_LEFT_WIDTH = '35%';

export const ConstructionTable = ({ construction, overflowMinWidth }) => {
  const { locale } = useParams();

  const constructionData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Target',
        value: {
          values: [
            construction.entityInfo && {
              primary: construction.entityInfo.entityName,
              secondary: construction.entityInfo.entityNation && construction.entityInfo.entityNation.name,
              image: {
                path: construction.entityInfo.entityImage,
                width: 35,
                height: 35,
              },
              link: {
                id: construction.entityInfo.entityId,
                locale: locale,
                path: Utils.getEntityRoute('unit')
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
        label: 'Distance',
        value: construction.distance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Construction speed*',
        value: construction.constructionSpeed + '% / sec (for 1 worker)',
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const labelData = {
    value: {
      tooltip: "Construction ID #" + construction.constructionId,
      id: construction.constructionId
    },
    valueRenderer: HeaderChip,
    shift: '21%'
  }

  return (
    <DoubleColumnFrame childrenProps={{ width: '100%' }} borderLabel={labelData}>
      <FlexibleTable
        columns={BUILD_COLUMNS}
        rows={constructionData.length}
        data={constructionData}
        minWidth={overflowMinWidth}
      />
    </DoubleColumnFrame>
  );
}