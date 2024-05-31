import * as React from 'react';
import './index.css';
import { useOutletContext } from 'react-router-dom';
import { ResearchTable } from 'components/Pages/ResearchPage/ResearchTable';
import { GridGroup, ResizableGrid } from 'components/Layout/ResizableGrid';
import { Box } from '@mui/material';

const MIN_WIDTH = 400;
const OVERFLOW_WIDTH = 200;
const COLUMN_WIDTH = 500;

export const ResearchPage = () => {
  const entity = useOutletContext();
  const research = entity;

  return (
    <>
      <Box display="flex" justifyContent="center" width="100%">
        <h3>Research</h3>
      </Box>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={1}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          <ResearchTable research={research} overflowMinWidth={OVERFLOW_WIDTH} />
        </GridGroup>
      </ResizableGrid>
    </>
  );
}