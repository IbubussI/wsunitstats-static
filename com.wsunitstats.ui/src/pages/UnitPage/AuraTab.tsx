import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { EntityInfo } from '@/components/common/EntityInfo';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { TagBox } from '@/components/common/TagBox';
import type { Unit } from '@/types/game';
import { TabLayout } from './TabLayout';

export const AuraTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const aura = unit.aura!;
  const rows = [
    { label: t('auraRangeCell'), value: aura.radius },
    { label: t('auraAffectsAlliesCell'), value: t(String(aura.affectsAllies)) },
    { label: t('auraAffectsEnemiesCell'), value: t(String(aura.affectsEnemies)) },
  ];
  // the game names attack kinds, e.g. 'projectile'; unknown ones are shown as they are
  const attackUnits = (attack: string) => t(`auraAttackUnits_${attack}`, { defaultValue: attack });

  return (
    <TabLayout title={t('auraTitle')} minWidth={250} columnWidth={500} paddingTop={1}>
      <Frame column>
        <FrameSection>
          <Box sx={{ padding: '7px' }}>
            <Typography variant='body2' color='text.primary'>
              {t('auraEffects')}
            </Typography>
            <Stack sx={{ paddingTop: '5px', gap: '5px' }}>
              {aura.researches.map(research => <EntityInfo
                key={research.entityId}
                primary={t(research.entityName)}
                image={research.entityImage}
                route={Constants.RESEARCH_PAGE_PATH}
                id={research.entityId}
                overflow />)}
            </Stack>
          </Box>
        </FrameSection>
        <FrameSection>
          <StatTable rows={rows} labelWidth='55%' minWidth={200} />
        </FrameSection>
        <FrameSection>
          {aura.affectedUnits?.length
            ? <TagBox label={t('auraAffectedUnits')} tags={aura.affectedUnits} />
            : <Box sx={{ padding: '7px' }}>
              <Typography variant='body2' color='text.primary'>
                {t('auraAffectedUnits')}
              </Typography>
              <Typography sx={{ paddingTop: '3px' }}>
                {aura.affectedAttack ? attackUnits(aura.affectedAttack) : t('auraAllUnits')}
              </Typography>
            </Box>}
        </FrameSection>
      </Frame>
    </TabLayout>
  );
};
