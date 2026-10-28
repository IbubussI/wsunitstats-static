import * as React from 'react';
import * as Constants from '@/utils/constants';
import { Box, debounce, Grid, Paper, Stack, useTheme } from '@mui/material';
import { ResizableBox, type ResizeCallbackData } from 'react-resizable';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

const MAX_COLUMNS = 12;
/** Gap between grid tiles, horizontal and vertical (theme spacing units, 8px each) */
const DEFAULT_TILE_SPACING = 4.5;

const readStoredWidth = () => Number(localStorage.getItem(Constants.LOCAL_RESIZABLE_WIDTH)) || 0;

interface ResizableGridProps {
  children: React.ReactNode;
  minWidth: number;
  defaultWidth?: number;
  paddingTop?: number;
}

/** Paper container with horizontal resize handle. Width is shared between pages and stored locally */
export const ResizableGrid = ({ children, minWidth, defaultWidth = Constants.DEFAULT_COLUMN_WIDTH, paddingTop = 3 }: ResizableGridProps) => {
  const [maxWidth, setMaxWidth] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current!;
    const initMaxWidth = container.clientWidth;
    setMaxWidth(initMaxWidth);
    const storedWidth = readStoredWidth();
    setWidth(storedWidth && storedWidth >= minWidth && storedWidth <= initMaxWidth ? storedWidth : defaultWidth);

    const handleWindowResize = debounce(() => setMaxWidth(container.clientWidth), 300);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      handleWindowResize.clear();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [defaultWidth, minWidth]);

  const onResizeStop = (_: React.SyntheticEvent, data: ResizeCallbackData) => {
    const stopWidth = data.size.width;
    if (stopWidth >= minWidth && stopWidth <= maxWidth) {
      localStorage.setItem(Constants.LOCAL_RESIZABLE_WIDTH, String(stopWidth));
    }
  };

  return (
    <Box ref={containerRef} sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
      <ResizableBox
        style={{ position: 'relative', minWidth: '0' }}
        width={width}
        // only width is resizable: ResizableBox sets "undefinedpx" height which is ignored, so height stays auto
        height={undefined as unknown as number}
        minConstraints={[minWidth, 0]}
        maxConstraints={[maxWidth, Infinity]}
        draggableOpts={{ grid: [4, 4] }}
        onResizeStop={onResizeStop}
        handle={<ResizeHandle />}
        axis='x'>
        <Paper elevation={3}
          sx={{
            padding: 1,
            paddingTop,
            width: '100%',
            boxSizing: 'border-box'
          }}>
          {children}
        </Paper>
      </ResizableBox>
    </Box>
  );
};

const ResizeHandle = React.forwardRef<HTMLDivElement, { handleAxis?: string }>((props, ref) => {
  const theme = useTheme();
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
        backgroundColor: theme.palette.background.default,
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
          backgroundColor: theme.palette.background.default,
          padding: '1px',
          border: '1px solid #076fad69',
          boxShadow: '0px 0px 4px #0779a6',
        }}>
          <FontAwesomeIcon icon={faEllipsisVertical} widthAuto />
        </Box>
      </Box>
    </Box>
  );
});

interface GridLayoutProps {
  children: React.ReactNode;
  columnWidth: number;
  /** gap between tiles in theme spacing units */
  spacing?: number;
}

/** Grid with as many columns of columnWidth as fit into its width */
export const GridLayout = ({ children, columnWidth, spacing = DEFAULT_TILE_SPACING }: GridLayoutProps) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [gridCols, setGridCols] = React.useState(1);

  React.useLayoutEffect(() => {
    const resizeHandler = (newWidth: number) => {
      const colsNumber = Math.max(1, Math.floor(newWidth / columnWidth));
      if (MAX_COLUMNS % colsNumber === 0) {
        setGridCols(colsNumber);
      }
    };

    resizeHandler(readStoredWidth());

    const content = contentRef.current!;
    const resizeObserver = new ResizeObserver(() => resizeHandler(content.clientWidth));
    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, [columnWidth]);

  const childrenArray = React.Children.toArray(children);
  const columns = Math.max(1, Math.min(gridCols, childrenArray.length));

  return (
    <Grid ref={contentRef} container spacing={spacing}>
      {childrenArray.map((child, index) => <Grid key={index} item xs={MAX_COLUMNS / columns}>{child}</Grid>)}
    </Grid>
  );
};

interface GridGroupProps {
  children: React.ReactNode;
  columnWidth: number;
  heading?: string;
  /** gap between tiles in theme spacing units */
  spacing?: number;
}

export const GridGroup = ({ columnWidth, children, heading, spacing }: GridGroupProps) => {
  const { t } = useTranslation();
  if (React.Children.toArray(children).length === 0) {
    return null;
  }
  return (
    <Stack>
      {heading && <h4 style={{ textAlign: 'center' }}>{t(heading)}</h4>}
      <GridLayout columnWidth={columnWidth} spacing={spacing}>
        {children}
      </GridLayout>
    </Stack>
  );
};
