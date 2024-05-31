import { Box, Stack } from "@mui/material";
import { Text } from "components/Atoms/Renderer";

export const FlexibleTable = ({ columns, rows, data, minWidth }) => {
  if (data.length < rows*columns) {
    fillEmptyRows(data, columns, rows);
  }
  return (
    <Box sx={{
      minWidth: minWidth,
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gridColumnGap: '0px',
      gridRowGap: '0px',
      gridAutoFlow: 'column',
      width: '100%',
      '&>*:nth-of-type(n):hover': { backgroundColor: 'rgb(225, 225, 225)' }
    }}>
      {data.map((entry, index) => {
        let rowSpan = 'span ' + (entry.rowSpan ? entry.rowSpan : '1');
        let Renderer = entry.renderer;
        let column = entry.column;
        let row = entry.row ? entry.row : 'auto';
        let backgroundColor = isFillBackground(index, rows, column) ? 'rgb(240, 240, 240)' : '';
        return (
          <Box
            key={index}
            gridColumn={column}
            gridRow={`${row} / ${rowSpan}`}
            minHeight='45px'
            backgroundColor={backgroundColor}
            overflow='hidden'>
            <Renderer data={entry.childData} />
          </Box>
        );
      })}
    </Box>
  );
}

export const FlexibleTableDoubleCellRow = ({ data }) => {
  const LabelRenderer = data.labelRenderer ? data.labelRenderer : Text;
  const ValueRenderer = data.valueRenderer ? data.valueRenderer : Text;
  return (
    <Stack
      direction="row"
      justifyContent='center'
      height='100%'>
      <Stack
        justifyContent='center'
        width={data.widthLeft ? data.widthLeft : '50%'}
        height='100%'
        sx={{ paddingLeft: '7px' }}>
        <LabelRenderer data={data.label} />
      </Stack>
      <Stack
        justifyContent='center'
        width={data.widthRight ? data.widthRight : '50%'}
        height='100%'
        sx={{ paddingLeft: '7px' }}>
        <ValueRenderer data={data.value} />
      </Stack>
    </Stack>
  );
}

export const FlexibleTableSingleCellRow = ({ data }) => {
  let ValueRenderer = data.valueRenderer ? data.valueRenderer : Text;
  let alignItems = data.alignItems ? data.alignItems : '';
  let width = data.width ? data.width : '100%';
  return (
    <Stack
      direction="row"
      justifyContent='center'
      width={width}
      alignItems={alignItems}
      height='100%'>
      <Stack
        justifyContent='center'
        width='100%'
        height='100%'
        sx={{ paddingLeft: '7px' }}>
        <ValueRenderer data={data.value} />
      </Stack>
    </Stack>
  );
}

function isFillBackground(index, rows, column) {
  if (isEven(rows)) {
    return isEven(index);
  } else {
    return isEven(column) ? isOdd(index) : !isOdd(index);
  }
}

function isEven(n) {
  return n % 2 === 0;
}

function isOdd(n) {
  return n % 2 !== 0;
}

function fillEmptyRows(data, columns, rows) {
  const appendDummyRows = (column, index, number) => {
    let dummyRow = {
      column: column,
      renderer: FlexibleTableDoubleCellRow,
      childData: { label: '', value: '' }
    }
    data.splice(index, 0, ...Array(number).fill(dummyRow));
  }

  const getSpannedNumber = (data) => {
    let spans = 0;
    for (let i = 0; i < data.length; ++i) {
      if (typeof data[i].rowSpan === 'number') {
        spans += data[i].rowSpan - 1;
      }
    }
    return spans;
  }

  for (let i = 1; i <= columns; ++i) {
    let columnData = data.filter(row => row.column === i);
    let spans = getSpannedNumber(columnData);
    let diff = rows - columnData.length - spans;
    if (diff > 0) {
      appendDummyRows(i, rows * (i - 1) + columnData.length, diff);
    }
  }
}