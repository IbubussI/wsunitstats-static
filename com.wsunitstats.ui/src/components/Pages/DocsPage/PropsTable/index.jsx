import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import styled from '@emotion/styled';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { alpha, IconButton, iconButtonClasses } from '@mui/material';
import './index.css';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const ContentTableCell = styled(React.forwardRef(
  (props, ref) => <TableCell ref={ref} {...props} />
))(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    lineHeight: 1.3,
  },
  padding: '6px',
  letterSpacing: 0,

}));

const TableCellText = styled('div')(({ theme }) => ({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap'
}));

const TableCellBox = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  '& svg': {
    width: '19px',
    height: '19px'
  }
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  [`&.${iconButtonClasses.root}`]: {
    padding: 0
  },
  color: '#5097c2'
}));


const IdTableCell = styled(TableCell)(({ theme }) => ({
  width: '30px',
  minWidth: '30px',
  textAlign: 'center',
  padding: '6px',
  borderRight: '1px solid rgb(190, 190, 190)',
  background: 'linear-gradient(to right, #e4f2f8 70%, #c6e6ff);',
  color: alpha(theme.palette.common.black, 0.45)
}));

const HeadingTableRow = styled(TableRow)(({ theme }) => ({
  background: 'linear-gradient(#d9f1fc 50%, #acdafc)',
  '& th:first-of-type': {
    background: 'linear-gradient(#d9f1fc 50%, #acdafc)'
  }
}));

const ContentTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.action.hover, 0.05),
  },
}));

const MIN_WIDTH_CELL = 70;

const ExpandableContentCell = (props) => {
  const ref = React.useRef();
  const [isOverflow, setOverflow] = React.useState(false);
  const [isExpanded, setExpanded] = React.useState(false);

  React.useLayoutEffect(() => {
    const resizeHandler = () => {
      const cell = ref.current;
      if (cell && cell.offsetWidth < cell.scrollWidth) {
        setOverflow(true);
      } else if (cell.style.overflow === 'hidden') {
        setOverflow(false);
      }
    };

    const resizeObserver = new ResizeObserver(() => resizeHandler());
    resizeObserver.observe(ref.current);

    // initial call
    resizeHandler();

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref.current]);

  React.useEffect(() => {
    const cell = ref.current;
    if (cell) {
      if (isExpanded) {
        cell.style.overflow = 'auto'
        cell.style.whiteSpace = 'normal'
        cell.style.wordBreak = 'break-all'
      } else {
        cell.style.overflow = 'hidden'
        cell.style.whiteSpace = 'nowrap'
        cell.style.wordBreak = 'break-all'
      }
    }
  }, [isExpanded]);

  return (
    <ContentTableCell {...props}>
      <TableCellBox>
        <TableCellText ref={ref}>
          {props.children}
        </TableCellText>
        <ExpandButton onClick={() => setExpanded(!isExpanded)}>
          {isOverflow && !isExpanded && <ArrowDropDownIcon />}
          {isOverflow && isExpanded && <ArrowDropUpIcon />}
        </ExpandButton>
      </TableCellBox>
    </ContentTableCell>
  ); 
};

export const PropsTable = ({ headCells, dataRows, autoSaveId }) => {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');
  const columnRefs = React.useRef(headCells.map(() => React.createRef()));
  const isResizing = React.useRef(-1);

  React.useEffect(() => {
    autoSaveId && loadFromLocalStorage();
    document.onmousemove = handleOnMouseMove;
    document.onmouseup = handleOnMouseUp;
    return () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }, []);

  const loadFromLocalStorage = () => {
    let columnsInfo = localStorage.getItem(autoSaveId);
    if (columnsInfo) {
      columnsInfo = JSON.parse(columnsInfo);
      Object.keys(columnsInfo).forEach((colField, index) => {
        columnRefs.current[index].current.parentElement.style.width = columnsInfo[colField];
      });
    }
  };

  const saveToLocalStorage = () => {
    let columnsInfo = {};
    for (let i = 0; i < headCells.length; ++i) {
      const col = headCells[i];
      columnsInfo[col.id] = columnRefs.current[i].current.parentElement.style.width;
    }
    localStorage.setItem(autoSaveId, JSON.stringify(columnsInfo));
  };

  const setCursorDocument = (isResizing) => {
    document.body.style.cursor = isResizing ? "col-resize" : "auto";
  };

  const handleOnMouseMove = (e) => {
    if (isResizing.current >= 0) {
      const index = isResizing.current;
      const handleRect = columnRefs.current[index].current.getBoundingClientRect();
      const diff = e.clientX - handleRect.right + handleRect.width / 2;

      const minWidth = headCells[index]?.minWidth ?? MIN_WIDTH_CELL;

      const leftCell = columnRefs.current[index].current.parentElement;
      const rightCell = columnRefs.current[index + 1].current.parentElement;

      const leftWidth = leftCell.getBoundingClientRect().width;
      const rightWidth = rightCell.getBoundingClientRect().width;

      let newLeftWidth = leftWidth + diff >= minWidth ? leftWidth + diff : minWidth;
      let newRightWidth = rightWidth - diff >= minWidth ? rightWidth - diff : minWidth;

      // find actual diffs and recalculate new width to min available diff
      // to prevent different resize for columns
      const leftDiff = newLeftWidth - leftWidth;
      const rightDiff = rightWidth - newRightWidth;

      const minDiff = Math.abs(leftDiff) < Math.abs(rightDiff) ? leftDiff : rightDiff;
      newLeftWidth = leftWidth + minDiff >= minWidth ? leftWidth + minDiff : minWidth;
      newRightWidth = rightWidth - minDiff < minWidth ? minWidth : rightWidth - minDiff;

      leftCell.style.width = newLeftWidth + "px";
      const isLast = index + 2 === headCells.length;
      rightCell.style.width = isLast ? 'auto' : newRightWidth + "px";
    }
  };

  const handleOnMouseUp = () => {
    if (isResizing.current >= 0) {
      isResizing.current = -1;
      autoSaveId && saveToLocalStorage();
      setCursorDocument(false);
    }
  };

  const onClickResizeColumn = (index) => {
    isResizing.current = index;
    setCursorDocument(true);
  };

  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  return (
    <TableContainer>
      <Table size='small' sx={{ tableLayout: 'fixed' }}>
        <TableHead sx={{ userSelect: 'none' }}>
          <HeadingTableRow>
            <IdTableCell />
            {headCells.map((headCell, i) => {
              return (
                <ContentTableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{ position: 'relative', width: headCell.width }}>
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}>
                    {headCell.label}
                  </TableSortLabel>
                  {i < headCells.length - 1
                    ? <div ref={columnRefs.current[i]}
                      onMouseDown={() => onClickResizeColumn(i)}
                      className='resizeLine' >
                      <svg viewBox="0 0 24 24">
                        <rect width="1" height="24" x="11.5" rx="0.5" />
                      </svg>
                    </div>
                    : <div ref={columnRefs.current[i]} />}
                </ContentTableCell>
              );
            })}
          </HeadingTableRow>
        </TableHead>
        <TableBody>
          {dataRows && dataRows.sort(getComparator(order, orderBy)).map((row, i) => {
            return (
              <ContentTableRow hover key={row.name + i.toString()}>
                <IdTableCell>{i + 1}</IdTableCell>
                <ExpandableContentCell>{row.name}</ExpandableContentCell>
                <ExpandableContentCell>{row.type}</ExpandableContentCell>
                <ExpandableContentCell>{row.value}</ExpandableContentCell>
              </ContentTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};