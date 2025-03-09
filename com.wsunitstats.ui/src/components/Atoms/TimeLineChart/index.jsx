import * as React from 'react';
import * as Utils from 'utils/utils';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
  LineElement,
  Interaction,
  Tooltip as ChartTooltip
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Box,
  Button,
  Fade,
  IconButton,
  Modal,
  Paper,
  Slider,
  Stack,
  styled,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'themeContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import savitzkyGolay from 'ml-savitzky-golay';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineController, LineElement);

// Override getLabelAndValue to return the interpolated value
const getLabelAndValue = LineController.prototype.getLabelAndValue;
LineController.prototype.getLabelAndValue = function (index) {
  if (index === -1) {
    const meta = this.getMeta();
    const pt = meta._pt;
    let label = 'outOfScope';
    let value = '';
    if (pt) {
      const vScale = meta.vScale;
      const iScale = meta.iScale;
      value = vScale.getValueForPixel(pt.y)

      // find closest to the point previous index
      const prev = Math.floor(iScale.min + iScale.getDecimalForPixel(pt.x) * (iScale.max - iScale.min));
      const next = prev + 1;
      label = prev;
      if (prev <= iScale.max && prev >= iScale.min) {
        const prevPixel = iScale.getPixelForValue(prev);
        const nextPixel = iScale.getPixelForValue(next);
  
        // find the time for current point
        const len = nextPixel - prevPixel;
        // label is interpolated x value, used for the title of tooltip
        label += (pt.x - prevPixel) / len;
      }
    }

    return {
      label: label,
      value: value
    };
  }
  return getLabelAndValue.call(this, index);
}

// add interaction (e - cursor position)
Interaction.modes.interpolate = function (chart, e) {
  const x = e.x;
  const items = [];
  const metas = chart.getSortedVisibleDatasetMetas();
  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    const pt = meta.dataset.interpolate({ x }, "x");
    if (pt && pt.y < chart.chartArea.bottom) {
      const element = new PointElement({
        ...pt, options: {
          borderColor: meta._dataset.dotIndicatorColor,
          backgroundColor: meta._dataset.dotIndicatorBgColor,
          radius: 4,
          borderWidth: 2
        }
      });
      meta._pt = element;
      items.push({ element, index: -1, datasetIndex: meta.index });
    } else {
      meta._pt = null;
    }
  }
  return items;
};

ChartTooltip.positioners.cursor = function (_, coordinates) {
  return coordinates;
};

const vRuler = {
  id: 'verticalRuler',
  defaults: {
    width: 2,
    color: '#FF4949'
  },
  beforeInit: (chart) => {
    chart._ruler = {
      x: 0
    };
  },
  afterEvent: (chart, args) => {
    const { inChartArea } = args;
    const { x } = args.event;

    chart._ruler = { x, draw: inChartArea };
    chart.draw();
  },
  beforeDatasetsDraw: (chart, _, opts) => {
    const { ctx } = chart;
    const { top, bottom } = chart.chartArea;
    const { x, draw } = chart._ruler;
    if (!draw) {
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = opts.width;
    ctx.strokeStyle = opts.color;
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, top);
    ctx.stroke();
    ctx.restore();
  }
};

const dotIndicator = {
  id: 'dotIndicator',
  afterDraw(chart) {
    const metas = chart.getSortedVisibleDatasetMetas();
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      if (meta._pt) {
        meta._pt.draw(chart.ctx);
      }
    }
  },
  afterEvent(chart, args) {
    if (!args.inChartArea) {
      const metas = chart.getSortedVisibleDatasetMetas();
      for (let i = 0; i < metas.length; i++) {
        metas[i]._pt = null;
      }
      args.changed = true;
    }
  }
};

const endIcon = {
  id: 'endIcon',
  afterDatasetsDraw(chart) {
    const metas = chart.getSortedVisibleDatasetMetas();
    const { ctx } = chart;
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const last = meta.dataset.last();
      const endImg = meta._dataset.endIcon;
      const imgWidth = endImg.width || 12;
      const imgHeight = endImg.height || 12;
      const imgX = last.x - imgWidth / 2;
      const imgY = last.y - imgHeight / 2;
      ctx.drawImage(endImg, imgX, imgY, imgWidth, imgHeight);
    }
  }
};

const hideDatasets = {
  id: 'hideDatasets',
  beforeUpdate(chart) {
    chart.data.datasets.forEach((dataset, i) => {
      chart.setDatasetVisibility(i, dataset.visible)
    });
  }
};

const ChartButton = styled(Button)({
  fontSize: '0.6rem',
  lineHeight: 1,
  paddingTop: 4,
  paddingBottom: 4
});

const ChartSlider = styled(Slider)({
  fontSize: '0.6rem',
  lineHeight: 1,
  paddingTop: 4,
  paddingBottom: 4
});

const ModalContent = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  padding: 4,
  backgroundColor: theme.palette.background.default
}));

// number to turn off smooth (min values of slider)
const SMOOTH_MIN = 0;
const SMOOTH_MAX = 15;
const SMOOTH_DEFAULT = 5;

const TimeLineChartContent = (props) => {
  const {
    datasets,
    datasetsVisible,
    labels,
    colors = [],
    title,
    stepTime,
    infoText,
    pointMarkers,
    endIcons,
    valTransformer = (val) => val > 0 && val < 1 ? val.toFixed(1) : val.toFixed(0),
    isModalOpen,
    openModal,
    closeModal
  } = props;
  const { t } = useTranslation();
  const chartRef = React.useRef(null);
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const [smoothLevel, setSmoothLevel] = React.useState(SMOOTH_DEFAULT);

  const processedPoints = React.useMemo(() => {
    if (smoothLevel === 0) {
      // no-smooth
      return datasets;
    }
    return datasets.map((points) => {
      const wSize = 2 * Math.ceil(Math.exp(smoothLevel*6/SMOOTH_MAX)) + 3;
      return savitzkyGolay(points, 1, { derivative: 0, windowSize: wSize, pad: 'pre', polynomial: 3 })
    });
  }, [datasets, smoothLevel]);

  const tickLabels = React.useMemo(() => {
    const length = datasets.reduce((accum, dataset) => Math.max(accum, dataset.length), 0);
    const short = new Array(length);
    for (let i = 0; i < length; i++) {
      short[i] = Utils.formatDurationChartShort(stepTime * i);
    }
    return short;
  }, [datasets, stepTime]);

  const defaultColor = themeContext.isDark ? theme.palette.primary.dark : theme.palette.primary.light;
  const endImages = endIcons.map((endIcon) => {
    const img = new Image(endIcon.width, endIcon.height);
    img.src = endIcon.src;
    return img;
  });
  const data = {
    labels: tickLabels, // use custom labels function
    datasets: processedPoints.map((points, i) => {
      return {
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
      }
    }),
  };

  const options = React.useMemo(() => ({
    devicePixelRatio: 1.5,
    maintainAspectRatio: false,
    interaction: {
      mode: "interpolate",
      intersect: false,
      axis: "x"
    },
    layout: {
      padding: {
        right: 6
      }
    },
    scales: {
      x: {
        ticks: {
          align: 'inner',
          autoSkip: true,
          autoSkipPadding: 10,
          maxRotation: 15,
          callback: (i) => {
            const label = tickLabels[i];
            return tickLabels[i - 1] === label ? null : label;
          }
        }
      },
      y: {
        stepSize: 0.1,
        suggestedMax: 1,
        min: 0,
        ticks: {
          callback: (t) => {
            return valTransformer(t);
          }
        }
      }
    },
    plugins: {
      tooltip: {
        position: 'cursor',
        intersect: false,
        filter: (item) => {
          // required to hide tooltip when hovering on axis ticks or other non-chart area items of canvas
          return item.label !== 'outOfScope';
        },
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems.length ? Utils.formatDurationChartLong(tooltipItems[0].label * stepTime) : '';
          },
          label: (tooltipItem) => {
            return tooltipItem.dataset.label + ': ' + valTransformer(tooltipItem.formattedValue);
          },
          labelColor: function (tooltipItem) {
            return {
              backgroundColor: tooltipItem.dataset.backgroundColor
            }
          }
        }
      },
      legend: {
        onClick: null,
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          filter: item => datasetsVisible[item.datasetIndex]
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl'
        },
        limits: {
          x: { minRange: 5 },
        },
        zoom: {
          drag: {
            enabled: true,
            threshold: 3
          },
          pinch: {
            enabled: true
          },
          mode: 'x'
        }
      }
    }
  }), [datasetsVisible, stepTime, tickLabels, valTransformer]);

  const resetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <Stack sx={{ height: '100%' }}>
      {/* control panel */}
      <Stack direction="row" gap={0.6} sx={{ justifyContent: 'right' }}>
        {/* title */}
        <Stack direction='row' gap={0.4} sx={{ flexGrow: 1 }}>
          <Typography variant="body1">
            {title}
          </Typography>
          {infoText && <InfoTextHelper text={infoText} />}
        </Stack>

        {/* smooth level */}
        <Stack gap={0.4} sx={{ alignItems: 'center', px: 1 }}>
          <Typography variant="caption" sx={{ lineHeight: 0.9 }}>
            {t('chartSmoothness')}
          </Typography>
          <ChartSlider
            sx={{ width: 80 }}
            size="small"
            value={smoothLevel}
            onChange={(_, newValue) => {
              setSmoothLevel(newValue)
            }}
            min={SMOOTH_MIN}
            max={SMOOTH_MAX}
            valueLabelDisplay="auto"
          />
        </Stack>

        {/* reset zoom */}
        <ChartButton onClick={resetZoom} variant='outlined'>
          {t('chartResetZoom')}
        </ChartButton>

        {/* open/close in modal */}
        <ChartButton onClick={() => isModalOpen ? closeModal() : openModal()} variant='outlined' sx={{ px: 0, minWidth: 24 }}>
          {isModalOpen ? <i className="fa-solid fa-minimize fa-lg"></i> : <i className="fa-solid fa-maximize fa-lg"></i>}
        </ChartButton>

        {/* info */}
        <InfoTextHelper text={
          <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
            {t('chartActionsDescription')}
          </Typography>
        } />
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 400 }}>
        <Line
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

  return (
    <Box>
      <TimeLineChartContent {...props} openModal={openModal} closeModal={closeModal} isModalOpen={modalOpen} />
      <Modal
        open={modalOpen}
        onClose={closeModal}
      >
        <ModalContent>
          <TimeLineChartContent {...props} openModal={openModal} closeModal={closeModal} isModalOpen={modalOpen} />
        </ModalContent>
      </Modal>
    </Box>
  );
};

const InfoTextHelper = ({ text }) => {
  return (
    <Tooltip
      arrow
      title={text}
      slots={{
        transition: Fade
      }}
      slotProps={{
        transition: { timeout: 600 },
      }}
    >
      <IconButton aria-label="delete" sx={{ p: 0, color: 'primary.main', maxHeight: '1em' }} disableTouchRipple>
        <HelpOutlineIcon />
      </IconButton>
    </Tooltip>
  );
};
