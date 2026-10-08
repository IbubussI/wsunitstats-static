import * as React from 'react';
import { Typography } from '@mui/material';

/**
 * Header of a replay page section, with 1.5x the default space: the sections are 8px apart,
 * so 4px more above it, and 1.5x the gutter below it
 */
export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h5" sx={{ mt: 0.5, mb: '0.525em' }}>
    {children}
  </Typography>
);
