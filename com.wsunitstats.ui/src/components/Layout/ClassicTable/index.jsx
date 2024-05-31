import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

export const ClassicTable = ({ data }) => {
  return (
    <Stack sx={{ marginBottom: '15px', alignItems: 'center' }}>
      <Typography sx={{
        padding: '7px',
        paddingBottom: '0',
        fontSize: 19,
        fontWeight: 'bold'
      }}>
        {data.label}
      </Typography>
      <Typography variant='body2' sx={{marginTop: '-4px'}}>
        {data.subLabel}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead sx={{
            '& tr th': {
              padding: '8px'
            }
          }}>
            <TableRow>
              {data.head.map((headCell, index) => {
                return (
                  <TableCell key={index} sx={{ width: index === 0 ? '60px' : 'auto' }}>
                    <Typography variant='body2' color='text.primary' sx={{ fontWeight: 'bold' }}>
                      {headCell}
                    </Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody sx={{
            '& tr td': {
              padding: '6px',
              paddingTop: '7px',
              paddingBottom: '7px'
            }
          }}>
            {data.body.map((row, index) =>
              <TableRow key={index}>
                {row.map((cell, index) => {
                  let CellRenderer = cell.renderer;
                  return (
                    <TableCell key={index} align={cell.align}>
                      <CellRenderer data={cell.data} />
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}