import * as React from 'react';
import * as Constants from "utils/constants";
import './index.css';
import { CommonTab } from 'components/Pages/UnitPage/Tabs/Common';
import { WeaponTab } from 'components/Pages/UnitPage/Tabs/Weapons';
import { AbilitiesTab } from 'components/Pages/UnitPage/Tabs/Abilities';
import { BuildingTab } from 'components/Pages/UnitPage/Tabs/Building';
import { ConstructionsTab } from 'components/Pages/UnitPage/Tabs/Constructions';
import { GatheringTab } from 'components/Pages/UnitPage/Tabs/Gathering';
import { HealTab } from 'components/Pages/UnitPage/Tabs/Heal';
import { AirplaneTab } from 'components/Pages/UnitPage/Tabs/Airplane';
import { SubmarineTab } from 'components/Pages/UnitPage/Tabs/Submarine';
import { EntityTabsView } from 'components/Pages/EntityPage/EntityTabsView';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { ResearchSelector } from "components/Pages/UnitPage/ResearchSelector";

export const UnitPage = () => {
  const { t } = useTranslation();
  const unit = useOutletContext();
  const tabsData = [
    {
      id: Constants.INITIAL_TAB,
      label: t('unitTabCommon'),
      component: CommonTab,
      isShow: !!unit
    },
    {
      id: Constants.UNIT_WEAPONS_TAB,
      label: t('unitTabWeapons'),
      component: WeaponTab,
      isShow: unit?.weapons?.length || unit?.turrets?.length
    },
    {
      id: Constants.UNIT_ABILITIES_TAB,
      label: t('unitTabAbilities'),
      component: AbilitiesTab,
      isShow: unit?.abilities?.length
    },
    {
      id: Constants.UNIT_BUILD_TAB,
      label: t('unitTabBuilding'),
      component: BuildingTab,
      isShow: unit?.build
    },
    {
      id: Constants.UNIT_CONSTRUCTION_TAB,
      label: t('unitTabConstruct'),
      component: ConstructionsTab,
      isShow: unit?.construction
    },
    {
      id: Constants.UNIT_GATHER_TAB,
      label: t('unitTabGather'),
      component: GatheringTab,
      isShow: unit?.gather
    },
    {
      id: Constants.UNIT_HEAL_TAB,
      label: t('unitTabHeal'),
      component: HealTab,
      isShow: unit?.heal
    },
    {
      id: Constants.UNIT_AIRPLANE_TAB,
      label: t('unitTabAirplane'),
      component: AirplaneTab,
      isShow: unit?.airplane
    },
    {
      id: Constants.UNIT_SUBMARINE_TAB,
      label: t('unitTabSubmarine'),
      component: SubmarineTab,
      isShow: unit?.submarine
    },
  ].filter(element => element.isShow);

  const researches = unit.applicableResearches;
  return (
    <>
      {researches && <Box display="flex" justifyContent="center" width="100%">
        <ResearchSelector researches={researches} />
      </Box>}
      <EntityTabsView entity={unit} tabsData={tabsData} />
    </>
  );
}