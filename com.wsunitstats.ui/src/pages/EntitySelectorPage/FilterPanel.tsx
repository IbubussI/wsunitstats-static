import { Box, styled } from '@mui/material';

/** Row of filter selects followed by the buttons */
export const FilterPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'stretch',
  padding: theme.spacing(2, 1, 3, 1)
}));

export const FilterButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '300px',
  height: '56px',
  gap: theme.spacing(1),
}));
