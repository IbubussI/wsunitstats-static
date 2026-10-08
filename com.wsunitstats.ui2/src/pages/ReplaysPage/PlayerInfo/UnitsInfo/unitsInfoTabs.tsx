import * as React from 'react';
import { Box, Stack, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UnitsInfo, countAllUnits } from './unitsInfo';
import type { Player } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

export const UnitsInfoTabs = ({ player }: { player: Player }) => {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
    setTab(newTab);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={withTotal(t('unitsInfoTabsCreatedTab'), player.unitsCreatedOn ? player.unitsCreated : undefined)} />
          <Tab label={withTotal(t('unitsInfoTabsKilledTab'), player.unitsKilledOn ? player.unitsKilledPlain : undefined)} />
          <Tab label={withTotal(t('unitsInfoTabsLostTab'), player.unitsLostOn ? player.unitsLostPlain : undefined)} />
        </Tabs>
      </Box>
      {player.unitsCreatedOn &&
        <UnitsInfoPanel
          value={tab}
          index={0}
          units={player.unitsCreated}
        />}
      {player.unitsKilledOn &&
        <GroupedUnitsInfoPanel
          value={tab}
          index={1}
          plain={player.unitsKilledPlain}
          groups={player.unitsKilledByFaction}
        />}
      {player.unitsLostOn &&
        <GroupedUnitsInfoPanel
          value={tab}
          index={2}
          plain={player.unitsLostPlain}
          groups={player.unitsLostByFaction}
        />
      }
    </Box>
  );
};

/** Label with the total number of units, e.g. "Killed (152)" */
const withTotal = (label: string, units?: Player['unitsCreated']) =>
  units ? `${label} (${countAllUnits(units)})` : label;

interface TabPanelProps {
  value: number;
  index: number;
  children?: React.ReactNode;
}

const TabPanel = (props: TabPanelProps) => {
  const { value, index, children, ...forwardedProps } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...forwardedProps}
    >
      {value === index && children}
    </div>
  );
};

const UnitsInfoPanel = (props: TabPanelProps & { units: Player['unitsCreated'] }) => {
  const { units, ...forwardedProps } = props;
  return (
    <TabPanel {...forwardedProps}>
      <UnitsInfo unitStatsMap={units} />
    </TabPanel>
  );
};

interface UnitGroup {
  name: string | null;
  units: Player['unitsCreated'];
}

const GroupedUnitsInfoPanel = (props: TabPanelProps & { plain: Player['unitsCreated']; groups: UnitGroup[] }) => {
  const { plain, groups, ...forwardedProps } = props;
  const { t } = useTranslation();
  const [isGroupView, setGroupView] = React.useState(false);

  return (
    <TabPanel {...forwardedProps}>
      <ToggleButtonGroup
        sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 1 }}
        color="primary"
        value={isGroupView}
        exclusive
        onChange={(_, val) => setGroupView(val)}
      >
        <ToggleButton value={false}>{t('unitsInfoTabsPlainVeiw')}</ToggleButton>
        <ToggleButton value={true}>{t('unitsInfoTabsGroupVeiw')}</ToggleButton>
      </ToggleButtonGroup>
      {isGroupView
        ? groups.map((group, i: number) =>
          <Stack gap={1} key={i}>
            <Box>
              <Typography variant="h6">
                {withTotal(group.name || t('replayFactionBot'), group.units)}
              </Typography>
              <UnitsInfo unitStatsMap={group.units} />
            </Box>
          </Stack>)
        : <UnitsInfo unitStatsMap={plain} />}
    </TabPanel>
  );
};
