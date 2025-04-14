import * as React from 'react';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UnitsInfo } from '.';

export const UnitKillsInfo = ({ unitsKilledPlain, unitsKilledByFaction }) => {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (_, newTab) => {
    setTab(newTab);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label={t('unitKillInfoOnlyUnitsTab')} />
          <Tab label={t('unitKillInfoByFactionsTab')} />
        </Tabs>
      </Box>
      <PlainUnitKills value={tab} index={0} unitsKilled={unitsKilledPlain} />
      <FactionUnitKills value={tab} index={1} factionUnitsKilled={unitsKilledByFaction} />
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

const PlainUnitKills = (props) => {
  const { unitsKilled, ...forwardedProps } = props;
  return (
    <TabPanel {...forwardedProps}>
      <UnitsInfo unitStatsMap={unitsKilled} />
    </TabPanel>
  );
};

const FactionUnitKills = (props) => {
  const { t } = useTranslation();
  const { factionUnitsKilled, ...forwardedProps } = props;
  return (
    <TabPanel {...forwardedProps}>
      {factionUnitsKilled.map((factionEntry, i) => 
        <Stack gap={1} key={i}>
          <Box>
            <Typography variant="h6">
              {factionEntry.name || t('replayFactionBot')}
            </Typography>
            <UnitsInfo unitStatsMap={factionEntry.unitsKilled} />
          </Box>
        </Stack>
      )}
    </TabPanel>
  );
};