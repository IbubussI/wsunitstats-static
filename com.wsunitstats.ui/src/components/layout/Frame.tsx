import * as React from 'react';
import { Box, Stack, type SxProps, type Theme } from '@mui/material';

const BORDER = '1px solid';

interface FrameProps {
  children: React.ReactNode;
  /** sections are placed in a column (default - in a row) */
  column?: boolean;
  /** element placed on the top border, e.g. HeaderChip */
  label?: React.ReactNode;
  /** horizontal position of the label center */
  labelShift?: string;
  disabled?: boolean;
}

/**
 * Bordered box that splits its sections (FrameSection) with borders.
 * Sections that are not rendered (null, false) are skipped
 */
export const Frame = ({ children, column, label, labelShift = '50%', disabled }: FrameProps) => {
  const borderColor = disabled ? 'error.main' : 'primary.dark';
  const separator = column ? 'borderBottom' : 'borderRight';
  if (React.Children.toArray(children).length === 0) {
    return null;
  }
  return (
    <Stack sx={{
      flexDirection: column ? 'column' : 'row',
      border: BORDER,
      borderColor,
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      '& > .frame-section:not(:last-child)': {
        [separator]: BORDER,
        borderColor
      }
    }}>
      {label && <Box sx={{
        position: 'absolute',
        left: labelShift,
        transform: 'translateX(-50%) translateY(-50%)'
      }}>
        {label}
      </Box>}
      {children}
    </Stack>
  );
};

export const FrameSection = ({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) => (
  <Box className='frame-section' sx={[
    { padding: '4px', boxSizing: 'border-box' },
    ...(Array.isArray(sx) ? sx : [sx])
  ]}>
    {children}
  </Box>
);
