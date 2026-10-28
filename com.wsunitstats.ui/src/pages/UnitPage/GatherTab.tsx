import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { withUnits } from '@/utils/utils';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { EntityInfo } from '@/components/common/EntityInfo';
import type { Gather, Unit } from '@/types/game';
import { TabLayout } from './TabLayout';

/** Resource column (gathered envs, arrow, resource), speed, bag size */
const COLUMNS = 'minmax(0, max-content) auto minmax(0, 1fr) auto auto';

export const GatherTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  return (
    <TabLayout title={t('gatherTitle')} minWidth={250} columnWidth={500} paddingTop={1}>
      <Frame column>
        <FrameSection sx={{ width: '100%' }}>
          <GatherTable gathers={unit.gather ?? []} />
        </FrameSection>
      </Frame>
    </TabLayout>
  );
};

/** One row per gathering: which envs give which resource, how fast and how much is carried at once */
const GatherTable = ({ gathers }: { gathers: Gather[] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // the resource head spans the envs, arrow and resource cells: one column that keeps the arrows aligned
  const head = [
    { label: t('gatherResourceHead'), span: 3 },
    { label: t('gatherSpeedCell'), span: 1 },
    { label: t('gatherBagSizeCell'), span: 1 }
  ];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: COLUMNS,
      alignItems: 'center',
      '& > .gather-row': { display: 'contents' },
      '& > .gather-row > *': { padding: '6px 8px', minHeight: '45px', boxSizing: 'border-box', display: 'flex', alignItems: 'center' },
      '& > .gather-row:nth-of-type(even) > *': { backgroundColor: theme.palette.action.hover },
      '& > .gather-row:not(:first-of-type):hover > *': { backgroundColor: alpha(theme.palette.action.hover, 0.2) }
    }}>
      <Box className='gather-row'>
        {head.map((cell, index) =>
          <Box key={index} sx={{ minHeight: 'auto !important', gridColumn: `span ${cell.span}` }}>
            <Typography variant='body2' color='text.primary' sx={{ fontWeight: 'bold' }}>{cell.label}</Typography>
          </Box>)}
      </Box>
      {gathers.map(gather =>
        <Box key={gather.gatherId} className='gather-row'>
          <Stack sx={{ gap: '4px', alignItems: 'flex-start !important', flexDirection: 'column', justifyContent: 'center' }}>
            {gather.envTags.map(env => <EntityInfo key={env.envId} primary={t(env.envName)} image={env.envImage} imageSize={30} overflow />)}
          </Stack>
          <Box>
            <ArrowForwardIcon fontSize='small' sx={{ color: 'text.secondary' }} />
          </Box>
          <Box>
            <EntityInfo primary={t(gather.resource.resourceName)} image={gather.resource.image} imageSize={30} overflow />
          </Box>
          <Box>
            <Typography variant='body2' color='text.primary' noWrap>{withUnits(gather.perSecond, t('perSecMarker'))}</Typography>
          </Box>
          <Box>
            <Typography variant='body2' color='text.primary'>{gather.bagSize}</Typography>
          </Box>
        </Box>)}
    </Box>
  );
};
