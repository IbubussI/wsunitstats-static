import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { withUnits } from '@/utils/utils';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { TagBox } from '@/components/common/TagBox';
import { SubValue } from '@/components/common/misc';
import type { Unit } from '@/types/game';
import { TabLayout } from './TabLayout';

export const AirplaneTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const airplane = unit.airplane!;
  const seconds = (value?: number) => withUnits(value, t(Constants.SECONDS_END_MARKER));
  const rows = [
    { label: <SubValue primary={t('airplaneFuelCell')} sub={t('airplaneFuelSubCell')} />, value: seconds(airplane.fuel) },
    { label: <SubValue primary={t('airplaneReloadCell')} sub={t('airplaneReloadSubCell')} />, value: seconds(airplane.rechargePeriod) },
    { label: t('airplaneRefuelSpeedCell'), value: withUnits(airplane.refuelSpeed, t('perSecMarker')) },
    { label: t('airplaneHealCell'), value: withUnits(airplane.healingSpeed, t('hpSecMarker')) },
    { label: t('airplaneAscensionSpeedCell'), value: airplane.ascensionSpeed },
    { label: t('airplaneHeightCell'), value: airplane.flyHeight },
    { label: t('airplaneSuicideCell'), value: t(String(!!airplane.kamikaze)) },
  ];

  return (
    <TabLayout title={t('airplaneTitle')} minWidth={250} columnWidth={450} paddingTop={1}>
      <Frame column>
        <FrameSection>
          <StatTable rows={rows} labelWidth='40%' minWidth={200} />
        </FrameSection>
        <FrameSection>
          <TagBox label={t('airplaneAerodromeTagsTitle')} tags={airplane.aerodromeTags} />
        </FrameSection>
      </Frame>
    </TabLayout>
  );
};
