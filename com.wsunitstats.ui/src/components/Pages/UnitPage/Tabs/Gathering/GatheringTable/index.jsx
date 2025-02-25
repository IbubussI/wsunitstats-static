import * as Utils from "utils/utils";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { FlexibleTable, FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";
import { EntityInfo, HeaderChip } from "components/Atoms/Renderer";
import { TagBox } from "components/Atoms/TagBox";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";

const GATHER_COLUMNS = 2;
const GATHER_ROWS = 4;
const FLEX_TABLE_RIGHT_WIDTH = '45%';
const FLEX_TABLE_LEFT_WIDTH = '55%';

export const GatheringTable = ({ gather, overflowMinWidth }) => {
  const { t } = useTranslation();

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
      <TransformInfo fromEnvs={gather.envTags} toResource={gather.resource} />
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
};

const TransformInfo = ({ fromEnvs, toResource }) => {
  const { t } = useTranslation();
  return (
    <Stack direction='row' sx={{
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      padding: '10px',

    }}>
      <Box sx={{ flexGrow: 1, flexBasis: 0 }} >
        <Box sx={{
          maxWidth: 'max-content',
          margin: 'auto'
        }}>
          <Stack direction="column" gap={1}>
            {fromEnvs.map((fromEnv) =>
              <EntityInfo data={{
                primary: t(fromEnv.envName),
                image: {
                  path: fromEnv.envImage,
                  width: 35,
                  height: 35,
                },
                link: {
                  id: fromEnv.envId,
                  path: Utils.getEntityRoute('env')
                },
                overflow: true
              }} />
            )}
          </Stack>
        </Box>
      </Box>
      <Box sx={{
        fontSize: '40px',
        lineHeight: '40px',
        color: 'primary.dark'
      }}>
        <i className="fa-solid fa-right-long"></i>
      </Box>
      <Box sx={{ flexGrow: 1, flexBasis: 0 }} >
        <Box sx={{
          maxWidth: 'max-content',
          margin: 'auto'
        }}>
          <EntityInfo data={{
            primary: t(toResource.resourceName),
            image: {
              path: toResource.image,
              width: 35,
              height: 35,
            },
            link: {
              id: toResource.resourceId,
              path: Utils.getEntityRoute('resource')
            },
            overflow: true
          }} />
        </Box>
      </Box>
    </Stack>
  );
};
