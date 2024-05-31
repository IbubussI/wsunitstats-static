import * as React from 'react';
import * as Utils from 'utils/utils';
import './index.css';
import { Box, Tab, Tabs } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export const EntityTabsView = ({
  entity,
  tabsData,
  tabsView: TabsViewComponent = TabsView
}) => {
  const { tab: currentTab } = useParams();
  const navigate = useNavigate();

  const isTabValid = React.useCallback((tab) => {
    if (tab) {
      for (const tab_ of tabsData) {
        if (tab_.id === tab) {
          return true;
        }
      }
    }
    return false;
  }, [tabsData]);

  const setTab = React.useCallback((tab) => {
    navigate(Utils.getUrlWithPathParams([{ param: tab, pos: 4 }]), { replace: true });
  }, [navigate]);

  React.useEffect(() => {
    if (tabsData.length) {
      if (currentTab) {
        if (!isTabValid(currentTab)) {
          Utils.navigateTo404(navigate);
        }
      } else {
        setTab(tabsData[0].id);
      }
    }
  }, [currentTab, tabsData, setTab, isTabValid, navigate]);

  return <TabsViewComponent tabsData={tabsData} currentTab={currentTab} setTab={setTab} entity={entity} />;
}

export const TabsView = ({ tabsData, currentTab, setTab, entity }) => {
  return (
    <>
      <Box display="flex" justifyContent="center" width="100%">
        <Tabs value={currentTab} onChange={(_, newTab) => setTab(newTab)} allowScrollButtonsMobile variant="scrollable">
          {tabsData.map((tab) => <Tab key={tab.id} label={tab.label} value={tab.id} />)}
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
}

const TabView = ({ selfValue, value, children }) => {
  return (
    <div className="entity-view-container" hidden={value !== selfValue}>
      {value === selfValue && children}
    </div>
  );
}