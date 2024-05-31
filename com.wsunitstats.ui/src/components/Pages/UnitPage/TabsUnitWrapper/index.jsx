import { ResearchSelector } from "components/Pages/UnitPage/ResearchSelector";
import { TabsView } from "components/Pages/EntityPage/EntityTabsView";
import { Box } from "@mui/material";

export const TabsUnitWrapper = (props) => {
  const researches = props.entity.applicableResearches;
  return (
    <>
      {researches && <Box display="flex" justifyContent="center" width="100%">
        <ResearchSelector researches={researches} />
      </Box>}
      <TabsView {...props} />
    </>
  );
}