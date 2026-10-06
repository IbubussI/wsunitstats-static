import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { withUnits } from '@/utils/utils';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { SubValue } from '@/components/common/misc';
import type { Unit } from '@/types/game';
import { TabLayout } from './TabLayout';

export const SubmarineTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const submarine = unit.submarine!;
  const rows = [
    { label: t('submarineUnderwaterTimeCell'), value: withUnits(submarine.underwaterTime, t(Constants.SECONDS_END_MARKER)) },
    { label: t('submarineSwimDepthCell'), value: submarine.swimDepth },
    { label: t('submarineAscensionSpeedCell'), value: submarine.ascensionSpeed },
    {
      label: <SubValue primary={t('submarineOnFuelEndCell')} sub={t('submarineOnFuelEndSubCell')} />,
      value: submarine.abilityOnFuelEnd
    },
  ];

  return (
    <TabLayout title={t('submarineTitle')} minWidth={250} columnWidth={450} paddingTop={1}>
      <Frame column>
        <FrameSection>
          <StatTable rows={rows} labelWidth='40%' minWidth={200} />
        </FrameSection>
      </Frame>
    </TabLayout>
  );
};
