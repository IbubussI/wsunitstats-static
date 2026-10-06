import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { withUnits } from '@/utils/utils';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { TagBox } from '@/components/common/TagBox';
import type { Unit } from '@/types/game';
import { TabLayout } from './TabLayout';

export const HealTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const heal = unit.heal!;
  const rows = [
    { label: t('healHealDistanceCell'), value: heal.distance },
    { label: t('healHealSpeedCell'), value: withUnits(heal.perSecond, t('hpSecMarker')) },
    { label: t('healSearchDistanceCell'), value: heal.searchNextDistance },
    { label: t('healAutoSearchDistanceCell'), value: heal.autoSearchTargetDistance },
    { label: t('healAutoSearchPeriodCell'), value: withUnits(heal.autoSearchTargetPeriod, t(Constants.SECONDS_END_MARKER)) },
  ];

  return (
    <TabLayout title={t('healTitle')} minWidth={250} columnWidth={500} paddingTop={1}>
      <Frame column>
        <FrameSection>
          <StatTable rows={rows} labelWidth='55%' minWidth={200} />
        </FrameSection>
        <FrameSection>
          <TagBox label={t('healTargetTags')} tags={heal.targetTags} />
        </FrameSection>
      </Frame>
    </TabLayout>
  );
};
