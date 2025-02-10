import { Chip, styled } from "@mui/material";

export const TagChip = styled(Chip)(() => ({
  borderRadius: '20px', // to match any height
  height: 'fit-content',
  backgroundColor: 'rgb(24, 117, 238)',
  textTransform: 'uppercase',
  color: 'white',
  '& span': {
    fontWeight: 'bold',
    fontSize: 11,
    whiteSpace: 'normal',
    textAlign: 'center',
    paddingTop: '4px',
    paddingBottom: '4px',
  }
}));