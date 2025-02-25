import * as React from 'react';
import * as Utils from 'utils/utils';
import './index.css';
import { Box, Tab, Tabs } from '@mui/material';
import { Link, useParams } from 'react-router-dom';

export const EntityTabsView = ({
  entity,
  tabsData
}) => {
  const { tab: currentTab } = useParams();
  
  return (
    <>
      <Box display="flex" justifyContent="center" width="100%">
        <Tabs value={currentTab} allowScrollButtonsMobile variant="scrollable">
          {tabsData.map((tab) => <Tab key={tab.id}
            label={tab.label}
            value={tab.id}
            component={Link}
            to={Utils.getUrlWithPathParams([{ param: tab.id, pos: 4 }])} />)}
        </Tabs>
      </Box>
      {tabsData.map((tab) => {
        const TabComponent = tab.component;
        return (
          <TabView key={tab.id} value={currentTab} selfValue={tab.id}>
            <TabComponent entity={entity} />
          </TabView>
        );
      })}
    </>
  );
};

const TabView = ({ selfValue, value, children }) => {
  return (
    <Box className="entity-view-container" hidden={value !== selfValue}>
      {value === selfValue && children}
    </Box>
  );
};
