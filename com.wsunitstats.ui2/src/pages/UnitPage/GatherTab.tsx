import { Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { withUnits } from '@/utils/utils';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { EntityInfo } from '@/components/common/EntityInfo';
import { HeaderChip } from '@/components/common/HeaderChip';
import { TagBox } from '@/components/common/TagBox';
import type { Gather, Unit } from '@/types/game';
import { TabLayout } from './TabLayout';

export const GatherTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  return (
    <TabLayout title={t('gatherTitle')} minWidth={250} columnWidth={500}>
      {unit.gather?.map((gather) => <GatherTable key={gather.gatherId} gather={gather} />)}
    </TabLayout>
  );
};

const GatherTable = ({ gather }: { gather: Gather }) => {
  const { t } = useTranslation();
  const rows = [
    { column: 1, label: t('gatherSpeedCell'), value: withUnits(gather.perSecond, t('perSecMarker')) },
    { column: 1, label: t('gatherBagSizeCell'), value: gather.bagSize },
    { column: 1, label: t('gatherAngleCell'), value: gather.angle },
    { column: 2, label: t('gatherGatherDistanceCell'), value: gather.gatherDistance },
    { column: 2, label: t('gatherPutDistanceCell'), value: gather.putDistance },
    { column: 2, label: t('gatherFindNextDistanceCell'), value: gather.findTargetDistance },
    { column: 2, label: t('gatherFindStorageDistanceCell'), value: gather.findStorageDistance },
  ];

  return (
    <Frame column label={
      <HeaderChip id={gather.gatherId} tooltip={t('gatherTooltipID', { value: gather.gatherId })} />
    }>
      <FrameSection sx={{ paddingTop: '10px' }}>
        <TransformInfo gather={gather} />
      </FrameSection>
      <FrameSection sx={{ width: '100%' }}>
        <StatTable rows={rows} columns={2} labelWidth='55%' minWidth={200} />
      </FrameSection>
      <FrameSection>
        <TagBox label={t('gatherStorageTags')} tags={gather.storageTags} />
        <TagBox label={t('tagContainerUnit')} tags={gather.unitTags} />
      </FrameSection>
    </Frame>
  );
};

/** Gathered envs -> resource */
const TransformInfo = ({ gather }: { gather: Gather }) => {
  const { t } = useTranslation();
  return (
    <Stack direction='row' sx={{ justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
      <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
        <Stack direction="column" gap={1} sx={{ maxWidth: 'max-content', margin: 'auto' }}>
          {gather.envTags.map((env) =>
            <EntityInfo key={env.envId} primary={t(env.envName)} image={env.envImage} overflow />
          )}
        </Stack>
      </Box>
      <Box sx={{ fontSize: '40px', lineHeight: '40px', color: 'primary.dark' }}>
        <i className="fa-solid fa-right-long"></i>
      </Box>
      <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
        <Box sx={{ maxWidth: 'max-content', margin: 'auto' }}>
          <EntityInfo primary={t(gather.resource.resourceName)} image={gather.resource.image} overflow />
        </Box>
      </Box>
    </Stack>
  );
};
