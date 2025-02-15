import * as Utils from "utils/utils";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip, TransformInfo } from "components/Atoms/Renderer";
import { useParams } from "react-router-dom";
import { TagBox } from "components/Atoms/TagBox";
import { useTranslation } from "react-i18next";

const GATHER_COLUMNS = 2;
const GATHER_ROWS = 4;
const FLEX_TABLE_RIGHT_WIDTH = '45%';
const FLEX_TABLE_LEFT_WIDTH = '55%';

export const GatheringTable = ({ gather, overflowMinWidth }) => {
  const { t } = useTranslation();
  const { locale } = useParams();

  const transformData = {
    from: {
      direction: 'column',
      values: gather.envTags.map((envTag) => {
        return ({
          primary: t(envTag.envName),
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
        primary: t(gather.resource.resourceName),
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
        label: t('gatherSpeedCell'),
        value: gather.perSecond && gather.perSecond + t('perSecMarker'),
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('gatherBagSizeCell'),
        value: gather.bagSize,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('gatherAngleCell'),
        value: gather.angle,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('gatherGatherDistanceCell'),
        value: gather.gatherDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('gatherPutDistanceCell'),
        value: gather.putDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('gatherFindNextDistanceCell'),
        value: gather.findTargetDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('gatherFindStorageDistanceCell'),
        value: gather.findStorageDistance,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    },
  ].filter(element => element.childData.value);

  const storageTagsData = {
    label: t('gatherStorageTags'),
    tags: gather.storageTags
  };

  const unitTagsData = {
    label: t('tagContainerUnit'),
    tags: gather.unitTags
  };

  const labelData = {
    value: {
      tooltip: t('gatherTooltipID', { value: gather.gatherId }),
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