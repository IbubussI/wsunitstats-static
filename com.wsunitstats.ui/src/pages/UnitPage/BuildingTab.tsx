import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { withUnits } from '@/utils/utils';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { RequirementsButton } from '@/components/layout/RequirementsButton';
import { ResourceIcons } from '@/components/common/misc';
import type { Resource, Unit } from '@/types/game';
import { TabLayout } from './TabLayout';

const resources = (cost?: Resource[]) => cost && <ResourceIcons resources={cost} />;

export const BuildingTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const build = unit.build!;

  const rows = [
    { label: t('buildFullCostCell'), value: resources(build.fullCost) },
    { label: t('buildInitCostCell'), value: resources(build.initCost) },
    { label: t('buildHealCostCell'), value: resources(build.healCost) },
    { label: t('buildIncomeValueCell'), value: resources(build.income?.value) },
    { label: t('buildIncomePeriodCell'), value: withUnits(build.income?.period, t(Constants.SECONDS_END_MARKER)) },
    { label: t('buildInitHealthCell'), value: build.initHealth },
    { label: t('buildBuildIdCell'), value: build.buildId },
  ];

  return (
    <TabLayout title={t('buildTitle')} minWidth={250} columnWidth={450} paddingTop={1}>
      <Frame column>
        <FrameSection sx={{ width: '100%' }}>
          <StatTable rows={rows} labelWidth='35%' minWidth={200} />
        </FrameSection>
        {build.requirements && <FrameSection>
          <RequirementsButton requirements={build.requirements} />
        </FrameSection>}
      </Frame>
    </TabLayout>
  );
};
