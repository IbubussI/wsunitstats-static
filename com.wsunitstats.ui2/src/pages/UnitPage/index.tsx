import * as React from 'react';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import { Link, Navigate, useLoaderData, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { entityUrl, parseEntityPath } from '@/utils/utils';
import { applyResearches } from '@/utils/researches';
import { toDisplayPrecision } from '@/utils/displayPrecision';
import type { Unit } from '@/types/game';
import { ResearchSelector } from './ResearchSelector';
import { CommonTab } from './CommonTab';
import { WeaponsTab } from './WeaponsTab';
import { AbilitiesTab, getShownAbilities } from './AbilitiesTab';
import { BuildingTab } from './BuildingTab';
import { ConstructionTab } from './ConstructionTab';
import { GatherTab } from './GatherTab';
import { HealTab } from './HealTab';
import { AuraTab } from './AuraTab';
import { AirplaneTab } from './AirplaneTab';
import { SubmarineTab } from './SubmarineTab';

interface UnitTab {
  id: string;
  label: string;
  isShow: boolean;
  Component: React.ComponentType<{ unit: Unit }>;
}

export const UnitPage = () => {
  const { locale, '*': path } = useParams();
  const loadedUnit = useLoaderData() as Unit | null;
  const [searchParams] = useSearchParams();
  const researchIdsParam = searchParams.get(Constants.PARAM_RESEARCH_IDS);

  const unit = React.useMemo(() => {
    const researchIds = researchIdsParam?.split(',').map(Number).filter(id => !isNaN(id)) ?? [];
    // scripts work with precise values, then values are rounded to their usual precision
    return loadedUnit && toDisplayPrecision(applyResearches(loadedUnit, researchIds));
  }, [loadedUnit, researchIdsParam]);

  if (!unit) {
    return <Navigate
      to={`/${locale}/${Constants.ERROR_PAGE_PATH}`}
      state={{ msg: 'Requested entity is not found', code: 404 }} replace />;
  }

  const { tab } = parseEntityPath(path ?? '', Constants.UNIT_TABS);
  return (
    <Box sx={{ p: 2, width: '100%' }}>
      {!!unit.applicableResearches?.length &&
        <Box display="flex" justifyContent="center" width="100%">
          <ResearchSelector researches={unit.applicableResearches} />
        </Box>}
      <UnitTabs unit={unit} currentTab={tab ?? Constants.INITIAL_TAB} />
    </Box>
  );
};

const UnitTabs = ({ unit, currentTab }: { unit: Unit; currentTab: string }) => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const { search } = useLocation();

  const tabs: UnitTab[] = [
    { id: Constants.INITIAL_TAB, label: t('unitTabCommon'), Component: CommonTab, isShow: true },
    { id: Constants.UNIT_WEAPONS_TAB, label: t('unitTabWeapons'), Component: WeaponsTab, isShow: !!(unit.weapons?.length || unit.turrets?.length) },
    { id: Constants.UNIT_ABILITIES_TAB, label: t('unitTabAbilities'), Component: AbilitiesTab, isShow: getShownAbilities(unit).length > 0 },
    { id: Constants.UNIT_BUILD_TAB, label: t('unitTabBuilding'), Component: BuildingTab, isShow: !!unit.build },
    { id: Constants.UNIT_CONSTRUCTION_TAB, label: t('unitTabConstruct'), Component: ConstructionTab, isShow: !!unit.construction?.length },
    { id: Constants.UNIT_GATHER_TAB, label: t('unitTabGather'), Component: GatherTab, isShow: !!unit.gather?.length },
    { id: Constants.UNIT_HEAL_TAB, label: t('unitTabHeal'), Component: HealTab, isShow: !!unit.heal },
    { id: Constants.UNIT_AURA_TAB, label: t('unitTabAura'), Component: AuraTab, isShow: !!unit.aura },
    { id: Constants.UNIT_AIRPLANE_TAB, label: t('unitTabAirplane'), Component: AirplaneTab, isShow: !!unit.airplane },
    { id: Constants.UNIT_SUBMARINE_TAB, label: t('unitTabSubmarine'), Component: SubmarineTab, isShow: !!unit.submarine },
  ].filter(tab => tab.isShow);

  const activeTab = tabs.find(tab => tab.id === currentTab);
  if (!activeTab) {
    // tab is not available for this unit
    return <Navigate to={entityUrl(locale, Constants.UNIT_PAGE_PATH, unit.gameId) + search} replace />;
  }

  return (
    <>
      <Box display="flex" justifyContent="center" width="100%">
        <Tabs value={activeTab.id} allowScrollButtonsMobile variant="scrollable">
          {tabs.map((tab) =>
            <Tab key={tab.id}
              label={tab.label}
              value={tab.id}
              component={Link}
              // research selection is kept when switching tabs
              to={entityUrl(locale, Constants.UNIT_PAGE_PATH, unit.gameId, tab.id) + search} />)}
        </Tabs>
      </Box>
      <Stack alignItems='center' justifyContent='center' width='100%'>
        <activeTab.Component unit={unit} />
      </Stack>
    </>
  );
};
