import { ConstructionTable } from "components/Pages/UnitPage/Tabs/Constructions/ConstructionTable";
import { GridGroup, ResizableGrid } from "components/Layout/ResizableGrid";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const MIN_WIDTH = 250;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const ConstructionsTab = ({ entity: unit }) => {
  const { t } = useTranslation();
  const Note = () => {
    return (
      <Typography variant="caption" color="text.secondary">
        {t('constructionNote')}
      </Typography>
    );
  }

  return (
    <>
      <h3>{t('constructionTitle')}</h3>
      <ResizableGrid minWidth={MIN_WIDTH}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          {unit.construction.map((construction, index) => <ConstructionTable key={index} construction={construction} overflowMinWidth={OVERFLOW_WIDTH}/>)}
        </GridGroup>
        <GridGroup>
          <Note />
        </GridGroup>
      </ResizableGrid>
    </>
  );
}