import * as Utils from 'utils/utils';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

const DamageRow = ({ data }) => {
  let textVariant = 'caption';
  let textColor = 'text.secondary';
  let paddingTop = data.rowStyle.paddingTop;
  if (data.index === 0) {
    textVariant = 'body2';
    textColor = 'text.primary';
    if (data.rowStyle.firstRowPaddingTop) {
      paddingTop = data.rowStyle.firstRowPaddingTop;
    }
  }
  return (
    <TableRow sx={{
      '& td': {
        paddingRight: '7px',
        paddingLeft: '7px',
        paddingTop: paddingTop,
        paddingBottom: data.rowStyle.paddingBottom,
        border: 0,
      }
    }}>
      <TableCell>
        <Typography variant={textVariant} color={textColor} sx={{ width: data.rowStyle.leftRowWidth }}>
          {data.row.leftCell}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: data.rowStyle.rightRowWidth }}>
        <Typography variant={textVariant} color={textColor}>
          {data.row.rightCell}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

const ResourceRow = ({ data }) => {
  let textVariant = 'body2';
  let textColor = 'text.primary';
  let paddingTop = data.rowStyle.paddingTop;
  if (data.index === 0 && data.rowStyle.firstRowPaddingTop) {
    paddingTop = data.rowStyle.firstRowPaddingTop;
  }
  return (
    <TableRow sx={{
      '& td': {
        paddingRight: '7px',
        paddingLeft: '7px',
        paddingTop: paddingTop,
        paddingBottom: data.rowStyle.paddingBottom,
        border: 0,
      }
    }}>
      <TableCell>
        <Typography variant={textVariant} color={textColor} sx={{ width: data.rowStyle.leftRowWidth }}>
          {data.row.resourceName}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: data.rowStyle.rightRowWidth }}>
        <Stack direction='row' alignItems='center'>
          <Box
            component="img"
            sx={{
              height: 24,
              width: 24,
              marginRight: 0.4
            }}
            alt=''
            src={Utils.resolveImage(data.row.image)}
          />
          <Typography variant='body2' color='text.primary'>
            {data.row.value}
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

const PopperRow = ({ data }) => {
  let textVariant = 'body2';
  let textColor = 'text.primary';
  let paddingTop = data.rowStyle.paddingTop;
  let Renderer = data.row.renderer;
  if (data.index === 0) {

    if (data.rowStyle.firstRowPaddingTop) {
      paddingTop = data.rowStyle.firstRowPaddingTop;
    }
  }
  return (
    <TableRow sx={{
      '& td': {
        paddingRight: '7px',
        paddingLeft: '7px',
        paddingTop: paddingTop,
        paddingBottom: data.rowStyle.paddingBottom,
        border: 0,
      }
    }}>
      <TableCell sx={{ verticalAlign: data.row.labelBaseline && 'baseline' }}>
        <Typography variant={textVariant} color={textColor} sx={{ width: data.rowStyle.leftRowWidth }}>
          {data.row.label}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: data.rowStyle.rightRowWidth }}>
        <Renderer data={data.row.value} />
      </TableCell>
    </TableRow>
  );
}

const VARIANTS = {
  damage: DamageRow,
  resource: ResourceRow,
  popper: PopperRow
}

export const DoubleColumnTable = ({ data }) => {
  let RowRenderer = VARIANTS[data.variant];
  let width = data.width ? data.width : 'max-content';
  let minWidth = data.minWidth ? data.minWidth : '';
  let tableLayout = data.tableLayout ? data.tableLayout : 'auto';
  return (
    <TableContainer>
      <Table sx={{ tableLayout: tableLayout, width: width, minWidth: minWidth }}>
        {data.label && <TableHead sx={{
          '& tr th': {
            paddingTop: '7px',
            paddingBottom: '7px'
          },
        }}>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant='body2' color='text.primary'>
                {data.label}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>}
        <TableBody>
          {data.content.map((row, index) => {
            return (
              <RowRenderer key={index} data={{
                index: index,
                row: row,
                rowStyle: data.rowStyle
              }} />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}