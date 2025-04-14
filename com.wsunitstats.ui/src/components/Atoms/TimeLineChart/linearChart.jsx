import * as React from 'react';
import * as Utils from 'utils/utils';
import './index.css';
import { Line } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Box,
  Modal,
  Paper,
  Stack,
  styled,
  useTheme
} from '@mui/material';
import { ThemeContext } from 'themeContext';
import { resolveEndIcon } from './chartIconResolver';
import { useChartState } from 'components/Hooks/useChartState';
import { ChartHead } from './chartHead';
import { dotIndicator, endIcon, hideDatasets, vRuler } from './plugins';
import { getDefaultOptions } from './helpers';

const ModalContent = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  overflow: 'auto',
  boxShadow: 24,
  padding: 4,
  backgroundColor: theme.palette.background.default
}));

const TimeLineChartContent = (props) => {
  const {
    id,
    datasets,
    datasetsVisible,
    labels, // use format { name: "...", index: 1 } to handle datasets with the same name correctly
    colors = [],
    title,
    stepTime,
    infoText,
    pointMarkers,
    results,
    valTransformer = (val) => val > 0 && val < 1 ? val.toFixed(1) : val.toFixed(0),
    isModalOpen,
    openModal,
    closeModal
  } = props;
  const chartRef = React.useRef(null);
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const xLength = React.useMemo(() => datasets.reduce((accum, dataset) => Math.max(accum, dataset.length), 0), [datasets]);
  const chartId = `${id}-chart`;
  const chartState = useChartState(chartRef, xLength, chartId);
  const {
    resetScale,
    tooltipOn,
    smooth
  } = chartState;

  // Set original scale when data size changed
  React.useEffect(() => {
    resetScale();
    // added datasets to reset on chart change
  }, [resetScale, datasets]);

  const processedPoints = React.useMemo(() =>
    datasets.map((points) => smooth.smooth(points)),
    [datasets, smooth]);

  const tickLabels = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < xLength; i++) {
      result[i] = Utils.formatDurationChartShort(stepTime * i);
    }
    return result;
  }, [stepTime, xLength]);

  const defaultColor = themeContext.isDark ? theme.palette.primary.dark : theme.palette.primary.light;
  const endImages = results.map((result) => resolveEndIcon(result, theme.palette.background.default));

  const data = {
    labels: tickLabels,
    datasets: processedPoints.map((points, i) => ({
      label: labels[i],
      data: points,
      fill: false,
      cubicInterpolationMode: 'monotone',
      borderColor: colors[i] || defaultColor,
      backgroundColor: colors[i] || defaultColor,
      pointBackgroundColor: 'transparent',
      pointRadius: pointMarkers ? undefined : 0,
      dotIndicatorColor: colors[i] || defaultColor,
      dotIndicatorBgColor: 'white',
      visible: datasetsVisible[i],
      endIcon: endImages[i]
    })),
  };

  const options = React.useMemo(() => {
    const opts = getDefaultOptions(chartState);
    opts.interaction = {
      mode: 'interpolate',
      intersect: false,
      axis: 'x'
    };
    opts.scales.y = {
      stepSize: 0.1,
      suggestedMax: 1,
      min: 0,
      ticks: {
        callback: (t) => {
          return valTransformer(t);
        }
      }
    };
    opts.plugins.tooltip = {
      enabled: tooltipOn,
      position: 'cursor',
      intersect: false,
      filter: (item) => {
        // required to hide tooltip when hovering on axis ticks or other non-chart area items of canvas
        return item.label !== 'outOfScope';
      },
      callbacks: {
        title: (tooltipItems) =>
          tooltipItems.length ? Utils.formatDurationChartLong(tooltipItems[0].label * stepTime) : '',
        label: (tooltipItem) => tooltipItem.dataset.label.name + ': ' + valTransformer(tooltipItem.formattedValue),
        labelColor: (tooltipItem) => ({ backgroundColor: tooltipItem.dataset.backgroundColor })
      }
    };
    return opts;
  }, [valTransformer, stepTime, tooltipOn, chartState]);

  return (
    <Stack sx={{ height: '100%' }}>
      <ChartHead
        isSmoothOn={true}
        isToggleTooltipOn={true}
        isZoomOn={true}
        isModalOn={true}
        title={title}
        infoText={infoText}
        chartState={chartState}
        modalState={{
          isModalOpen,
          openModal,
          closeModal
        }} />
      <Box sx={{ flexGrow: 1, height: 400 }}>
        <Line
          id={chartId}
          ref={chartRef}
          options={options}
          data={data}
          plugins={[vRuler, dotIndicator, endIcon, hideDatasets, zoomPlugin]}
        />
      </Box>
    </Stack>
  );
};

export const TimeLineChart = (props) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const TimeLineContent = <TimeLineChartContent {...props} openModal={openModal} closeModal={closeModal} isModalOpen={modalOpen} />;
  return (
    <Box>
      {!modalOpen && TimeLineContent}
      <Modal
        open={modalOpen}
        onClose={closeModal}
      >
        <ModalContent>
          {modalOpen && TimeLineContent}
        </ModalContent>
      </Modal>
    </Box>
  );
};
