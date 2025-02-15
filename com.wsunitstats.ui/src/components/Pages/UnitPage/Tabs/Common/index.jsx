import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { CommonTable } from "components/Pages/UnitPage/Tabs/Common/CommonTable";
import { useTranslation } from "react-i18next";

const MIN_WIDTH = 400;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const CommonTab = ({ entity: unit }) => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('commonTitle')}</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <CommonTable unit={unit} overflowMinWidth={OVERFLOW_WIDTH}/>
        </GridGroup>
      </ResizableGrid>
    </>
  );
}
