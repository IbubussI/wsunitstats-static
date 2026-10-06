import { Box, Stack, Typography } from '@mui/material';
import { Navigate, useLoaderData, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { localizeNation } from '@/utils/utils';
import { GridGroup, ResizableGrid } from '@/components/layout/ResizableGrid';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { EntityInfo } from '@/components/common/EntityInfo';
import { EntityImage } from '@/components/common/misc';
import type { EntityInfo as EntityInfoData, Research } from '@/types/game';

const MIN_WIDTH = 400;
const COLUMN_WIDTH = 500;
const GRID_ITEM_WIDTH = 170;
const GRID_ITEM_GAP = 4;

export const ResearchPage = () => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const research = useLoaderData() as Research | null;

  if (!research) {
    return <Navigate
      to={`/${locale}/${Constants.ERROR_PAGE_PATH}`}
      state={{ msg: 'Requested entity is not found', code: 404 }} replace />;
  }

  // unique units affected by the research
  const units = (research.upgrades ?? [])
    .map(upgrade => upgrade.unit)
    .filter((unit, index, array): unit is EntityInfoData =>
      !!unit && array.findIndex(other => other?.entityId === unit.entityId) === index);

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Box display="flex" justifyContent="center" width="100%">
        <h3>{t('researchPageTitle')}</h3>
      </Box>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <Frame column>
            <FrameSection>
              <Stack alignItems='center' spacing={0.8}>
                <h3 style={{ marginBlockStart: '0.4em', marginBlockEnd: '0.65em', textAlign: 'center' }}>{t(research.name)}</h3>
                <EntityImage image={research.image} size='100px' />
                <Typography variant='body2' align='center'>
                  {t(research.description)}
                </Typography>
                <Typography variant='body2' align='center'>
                  {t('researchPageGameIDLabel', { value: research.gameId })}
                </Typography>
              </Stack>
            </FrameSection>
            {units.length > 0 && <FrameSection sx={{ overflow: 'auto', width: '100%' }}>
              <Stack alignItems='center' spacing={0.8}>
                <p>{t('researchPageAffectedUnits')}</p>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fill, ${GRID_ITEM_WIDTH}px)`,
                  gap: `${GRID_ITEM_GAP}px`,
                  width: '100%',
                  maxWidth: `${GRID_ITEM_WIDTH * units.length + GRID_ITEM_GAP * (units.length - 1)}px`
                }}>
                  {units.map(unit =>
                    <EntityInfo key={unit.entityId}
                      primary={t(unit.entityName)}
                      secondary={unit.entityNation ? localizeNation(t, unit.entityNation.name) : 'ID: ' + unit.entityId}
                      image={unit.entityImage}
                      imageSize={50}
                      route={Constants.UNIT_PAGE_PATH}
                      id={unit.entityId} />
                  )}
                </Box>
              </Stack>
            </FrameSection>}
          </Frame>
        </GridGroup>
      </ResizableGrid>
    </Box>
  );
};
