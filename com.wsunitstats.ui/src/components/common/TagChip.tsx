import * as React from 'react';
import { Chip, Stack, styled, type ChipProps } from '@mui/material';

interface TagChipProps extends ChipProps {
  tColor?: string;
  bgColor?: string;
}

export const TagChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'tColor' && prop !== 'bgColor'
})<TagChipProps>(({ tColor, bgColor }) => ({
  borderRadius: '20px', // to match any height
  height: 'fit-content',
  backgroundColor: bgColor || 'rgb(24, 117, 238)',
  textTransform: 'uppercase',
  color: tColor || 'white',
  '& span': {
    fontWeight: 'bold',
    fontSize: 11,
    whiteSpace: 'normal',
    textAlign: 'center',
    paddingTop: '4px',
    paddingBottom: '4px',
  }
}));

interface IconTagChipProps extends TagChipProps {
  tagIcon?: React.ReactNode;
}

export const IconTagChip = (props: IconTagChipProps) => {
  const {
    tagIcon,
    label,
    ...forwardedProps
  } = props;
  return (
    <TagChip
      {...forwardedProps}
      label={
        tagIcon ? <Stack direction="row" sx={{ alignItems: 'center' }}>
          <span style={{ all: 'unset' }}>{label}</span>
          {tagIcon}
        </Stack> : label
      }
    />
  );
};
