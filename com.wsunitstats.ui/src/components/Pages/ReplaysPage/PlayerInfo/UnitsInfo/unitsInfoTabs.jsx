import * as React from 'react';
import { Box, Stack, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UnitsInfo } from '.';

export const UnitsInfoTabs = ({ player }) => {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (_, newTab) => {
    setTab(newTab);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={t('unitsInfoTabsCreatedTab')} />
          <Tab label={t('unitsInfoTabsKilledTab')} />
          <Tab label={t('unitsInfoTabsLostTab')} />
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

const TabPanel = (props) => {
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

const UnitsInfoPanel = (props) => {
  const { units, ...forwardedProps } = props;
  return (
    <TabPanel {...forwardedProps}>
      <UnitsInfo unitStatsMap={units} />
    </TabPanel>
  );
};

const GroupedUnitsInfoPanel = (props) => {
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
        ? groups.map((group, i) =>
          <Stack gap={1} key={i}>
            <Box>
              <Typography variant="h6">
                {group.name || t('replayFactionBot')}
              </Typography>
              <UnitsInfo unitStatsMap={group.units} />
            </Box>
          </Stack>)
        : <UnitsInfo unitStatsMap={plain} />}
    </TabPanel>
  );
};
