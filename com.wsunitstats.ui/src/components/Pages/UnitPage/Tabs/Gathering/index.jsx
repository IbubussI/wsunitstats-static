import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { GatheringTable } from "components/Pages/UnitPage/Tabs/Gathering/GatheringTable";
import { useTranslation } from "react-i18next";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const GatheringTab = ({ entity: unit }) => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('gatherTitle')}</h3>
      <ResizableGrid minWidth={MIN_WIDTH}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          {unit.gather.map((gatherEntry, index) => <GatheringTable key={index} gather={gatherEntry} overflowMinWidth={OVERFLOW_WIDTH}/>)}
        </GridGroup>
      </ResizableGrid>
    </>
  );
}