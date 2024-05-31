import * as Utils from "utils/utils";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip, TransformInfo } from "components/Atoms/Renderer";
import { useParams } from "react-router-dom";
import { TagBox } from "components/Atoms/TagBox";

const GATHER_COLUMNS = 2;
const GATHER_ROWS = 4;
const FLEX_TABLE_RIGHT_WIDTH = '45%';
const FLEX_TABLE_LEFT_WIDTH = '55%';

export const GatheringTable = ({ gather, overflowMinWidth }) => {
  const { locale } = useParams();

  const transformData = {
    from: {
      direction: 'column',
      values: gather.envTags.map((envTag) => {
        return ({
          primary: envTag.envName,
          image: {
            path: envTag.envImage,
            width: 35,
            height: 35,
          },
          link: {
            id: envTag.envId,
            locale: locale,
            path: Utils.getEntityRoute('env')
          },
          overflow: true
        });
      }),
    },
    to: {
      values: [{
        primary: gather.resource.resourceName,
        image: {
          path: gather.resource.image,
          width: 35,
          height: 35,
        },
        link: {
          id: gather.resource.resourceId,
          locale: locale,
          path: Utils.getEntityRoute('resource')
        },
        overflow: true
      }],
    },
    fromRenderer: EntityInfo,
    toRenderer: EntityInfo,
  }

  const gatherData = [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Gather speed',
        value: gather.perSecond && gather.perSecond + ' / sec',
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Bag size',
        value: gather.bagSize,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Gather angle',
        value: gather.angle,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Gather distance',
        value: gather.gatherDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Put distance',
        value: gather.putDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Find next distance',
        value: gather.findTargetDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Find storage distance',
        value: gather.findStorageDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const storageTagsData = {
    label: 'Storage tags:',
    tags: gather.storageTags
  };

  const unitTagsData = {
    label: 'Unit tags:',
    tags: gather.unitTags
  };

  const labelData = {
    value: {
      tooltip: "Gather ID #" + gather.gatherId,
      id: gather.gatherId
    },
    valueRenderer: HeaderChip,
    shift: '50%'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '10px' }, { width: '100%' }]} borderLabel={labelData} column>
      <TransformInfo data={transformData} />
      <FlexibleTable
        columns={GATHER_COLUMNS}
        rows={GATHER_ROWS}
        data={gatherData}
        minWidth={overflowMinWidth}
      />
      <>
        <TagBox tagsData={storageTagsData} />
        <TagBox tagsData={unitTagsData} />
      </>
    </DoubleColumnFrame>
  );
}