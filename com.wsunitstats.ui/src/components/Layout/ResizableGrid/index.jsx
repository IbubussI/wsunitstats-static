import * as React from 'react';
import * as Constants from 'utils/constants'
import { Box, Grid, Stack, debounce } from "@mui/material";
import { BasicPaper } from "components/Atoms/BasicPaper";
import { ResizableBox } from 'react-resizable';

const MAX_COLUMNS = 12;

export const ResizableGrid = ({ children, minWidth, defaultWidth = Constants.DEFAULT_COLUMN_WIDTH, paddingTop }) => {
  const [maxWidth, setMaxWidth] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const containerRef = React.useRef(null);

  const debouncedWindowResizeHandler = React.useMemo(
    () => debounce(() => setMaxWidth(containerRef.current.clientWidth), 300),
    [],
  );

  React.useLayoutEffect(() => {
    const initMaxWidth = containerRef.current.clientWidth;
    setMaxWidth(initMaxWidth);
    const localWidth = localStorage.getItem(Constants.LOCAL_RESIZABLE_WIDTH);
    let localWidthN = Number(localWidth);
    if (!localWidth || localWidthN < minWidth || localWidthN > initMaxWidth) {
      localWidthN = defaultWidth;
    }
    setWidth(localWidthN);

    window.addEventListener("resize", debouncedWindowResizeHandler);
    return () => {
      window.removeEventListener("resize", debouncedWindowResizeHandler);
    }
  }, [defaultWidth, minWidth, debouncedWindowResizeHandler]);

  const onResizeStop = (_, data) => {
    const stopWidth = data.size.width;
    if (typeof stopWidth === 'number' && stopWidth >= minWidth && stopWidth <= maxWidth) {
      localStorage.setItem(Constants.LOCAL_RESIZABLE_WIDTH, stopWidth);
    }
  }

  return (
    <Box ref={containerRef} sx={{
      display: 'flex',
      width: '100%',
      justifyContent: 'center'
    }}>
      <ResizableBox
        style={{ position: 'relative', minWidth: '0' }}
        width={width}
        minConstraints={[minWidth]}
        maxConstraints={[maxWidth]}
        draggableOpts={{ grid: [4, 4] }}
        onResizeStop={onResizeStop}
        handle={<ResizeHandle />}
        axis='x'>
        <BasicPaper sx={{ padding: 1, paddingTop: typeof paddingTop === 'number' ? paddingTop : 3, width: '100%', boxSizing: 'border-box' }}>
          {children}
        </BasicPaper>
      </ResizableBox>
    </Box>
  );
}

const ResizeHandle = React.forwardRef((props, ref) => {
  const { handleAxis, ...restProps } = props;
  return (
    <Box
      ref={ref}
      {...restProps}
      sx={{
        position: 'absolute',
        top: '0',
        left: 'calc(100% - 5px)',
        width: '10px',
        height: '100%',
        '&:hover': {
          cursor: 'col-resize'
        }
      }}>
      <Box sx={{
        height: '100%',
        width: '4px',
        backgroundColor: 'white',
        margin: 'auto',
        border: '1px solid #076fad69',
        boxShadow: '0px 0px 3px #0779a6',
        boxSizing: 'border-box',
      }}>
        <Box sx={{
          position: 'relative',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '15px',
          width: 'fit-content',
          lineHeight: 0,
          color: 'rgb(85, 120, 218)',
          backgroundColor: 'white',
          padding: '1px',
          border: '1px solid #076fad69',
          boxShadow: '0px 0px 4px #0779a6',
        }}>
          <i className="fa-sharp fa-solid fa-ellipsis-vertical"></i>
        </Box>
      </Box>
    </Box>
  );
});

export const GridLayout = ({ children, columnWidth }) => {
  const contentRef = React.useRef(null);
  const [gridCols, setGridCols] = React.useState(1);

  React.useLayoutEffect(() => {
    const resizeHandler = (newWidth) => {
      const colsNumber = Math.floor(newWidth / columnWidth);
      if (MAX_COLUMNS % colsNumber === 0) {
        setGridCols(colsNumber);
      }
    }

    resizeHandler(localStorage.getItem(Constants.LOCAL_RESIZABLE_WIDTH));

    const resizeObserver = new ResizeObserver(() => resizeHandler(contentRef.current.clientWidth));
    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [columnWidth]);

  const childrenArray = getArray(children).filter(element => element).flat();
  const columns = Math.min(gridCols, childrenArray.length);

  return (
    <Grid ref={contentRef} container spacing={3}>
      {childrenArray.map((child, index) => <Grid key={index} item xs={MAX_COLUMNS / columns}>{child}</Grid>)}
    </Grid>
  );
}

const getArray = (object) => {
  if (Array.isArray(object)) {
    return object;
  } else {
    return [object];
  }
}

export const GridGroup = ({ columnWidth, children, heading }) => {
  return (
    <Stack>
      {heading && <h4 style={{ textAlign: 'center' }}>{heading}</h4>}
      <GridLayout columnWidth={columnWidth}>
        {children}
      </GridLayout>
    </Stack>
  );
}