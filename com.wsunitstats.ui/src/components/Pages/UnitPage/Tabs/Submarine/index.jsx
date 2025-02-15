import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { SubmarineTable } from "components/Pages/UnitPage/Tabs/Submarine/SubmarineTable";
import { useTranslation } from "react-i18next";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 450;

export const SubmarineTab = ({ entity: unit }) => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('submarineTitle')}</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <SubmarineTable submarine={unit.submarine} overflowMinWidth={OVERFLOW_WIDTH} />
        </GridGroup>
      </ResizableGrid>
    </>
  );
}