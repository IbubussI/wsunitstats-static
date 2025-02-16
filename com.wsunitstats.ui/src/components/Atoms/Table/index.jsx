import { styled, TableRow } from "@mui/material";

export const NoBottomBorderRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 }
}));