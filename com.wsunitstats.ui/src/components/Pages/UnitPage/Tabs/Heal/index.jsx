import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { HealTable } from "components/Pages/UnitPage/Tabs/Heal/HealTable";
import { useTranslation } from "react-i18next";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const HealTab = ({ entity: unit }) => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('healTitle')}</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <HealTable heal={unit.heal} overflowMinWidth={OVERFLOW_WIDTH} />
        </GridGroup>
      </ResizableGrid>
    </>
  );
}