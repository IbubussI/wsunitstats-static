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
import { TabsUnitWrapper } from 'components/Pages/UnitPage/TabsUnitWrapper';
import { EntityTabsView } from 'components/Pages/EntityPage/EntityTabsView';
import { useOutletContext } from 'react-router-dom';

export const UnitPage = () => {
  const entity = useOutletContext();
  const unit = entity;
  const tabsData = [
    {
      id: Constants.INITIAL_TAB,
      label: 'Common',
      component: CommonTab,
      isShow: !!unit
    },
    {
      id: Constants.UNIT_WEAPONS_TAB,
      label: 'Weapons',
      component: WeaponTab,
      isShow: unit?.weapons?.length || unit?.turrets?.length
    },
    {
      id: Constants.UNIT_ABILITIES_TAB,
      label: 'Abilities',
      component: AbilitiesTab,
      isShow: unit?.abilities?.length
    },
    {
      id: Constants.UNIT_BUILD_TAB,
      label: 'Building',
      component: BuildingTab,
      isShow: unit?.build
    },
    {
      id: Constants.UNIT_CONSTRUCTION_TAB,
      label: 'Construct',
      component: ConstructionsTab,
      isShow: unit?.construction
    },
    {
      id: Constants.UNIT_GATHER_TAB,
      label: 'Gather',
      component: GatheringTab,
      isShow: unit?.gather
    },
    {
      id: Constants.UNIT_HEAL_TAB,
      label: 'Heal',
      component: HealTab,
      isShow: unit?.heal
    },
    {
      id: Constants.UNIT_AIRPLANE_TAB,
      label: 'Airplane',
      component: AirplaneTab,
      isShow: unit?.airplane
    },
    {
      id: Constants.UNIT_SUBMARINE_TAB,
      label: 'Submarine',
      component: SubmarineTab,
      isShow: unit?.submarine
    },
  ].filter(element => element.isShow);

  return (
    <EntityTabsView entity={unit} tabsData={tabsData} tabsView={TabsUnitWrapper} />
  );
}