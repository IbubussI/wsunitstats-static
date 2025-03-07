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
  Interaction
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Box,
  Button,
  Fade,
  IconButton,
  Popper,
  Stack,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'themeContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineController, LineElement);
ChartJS.register(zoomPlugin);

// Override getLabelAndValue to return the interpolated value
const getLabelAndValue = LineController.prototype.getLabelAndValue;
LineController.prototype.getLabelAndValue = function (index) {
  if (index === -1) {
    const meta = this.getMeta();
    const pt = meta._pt;
    const vScale = meta.vScale;
    const iScale = meta.iScale;

    // find closest to the point previous index
    const prev = Math.floor(iScale.min + iScale.getDecimalForPixel(pt.x) * (iScale.max - iScale.min));
    const next = prev + 1;
    let labelVal = prev;
    if (prev <= iScale.max && prev >= iScale.min) {
      const prevPixel = iScale.getPixelForValue(prev);
      const nextPixel = iScale.getPixelForValue(next);

      // find the time for current point
      const len = nextPixel - prevPixel;
      labelVal += (pt.x - prevPixel) / len;
    }

    // label val is interpolated x value in index scale, used for the title of tooltip
    return {
      label: labelVal,
      value: vScale.getValueForPixel(pt.y)
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
    if (args.event.type === 'mouseout') {
      const metas = chart.getSortedVisibleDatasetMetas();
      for (let i = 0; i < metas.length; i++) {
        metas[i]._pt = null;
      }
      args.changed = true;
    }
  }
}

ChartJS.register(vRuler, dotIndicator);

const WINDOWS = {
  '9': {
    norm: 231,
    ki: [
      -21, 14, 39, 54, 59, 54, 39, 14, -21
    ]
  },
};

// data processor for smoothing
const SAVGOL_SMOOTH = {
  name: 'savgol',
  process: (points, degree) => {
    const window = WINDOWS[degree];
    if (!window) {
      console.error("Provided smoothing window size is not supported");
      return points;
    }

    const result = [];
    const d = Math.floor(window.ki.length / 2);
    for (let i = 0; i < points.length; i++) {
      let sum = 0;
      for (let j = 0; j < window.ki.length; j++) {
        let index = i + (j - d);
        // add fake points at the begin and end of the dataset to smooth them too
        if (index < 0 || index >= points.length) {
          index = i - (j - d);
        }
        sum += points[index] * window.ki[j];
      }
      result.push(sum / window.norm);
    }
    return result;
  }
};

const PROCESSORS = [
  { label: 'chartProcessorSavGolSmooth', value: SAVGOL_SMOOTH.name },
  { label: 'chartProcessorDefault', value: 'default' }
];

const ChartToggle = styled(ToggleButton)({
  fontSize: '0.6rem',
  lineHeight: 1,
  paddingTop: 4,
  paddingBottom: 4
});

const ChartButton = styled(Button)({
  fontSize: '0.6rem',
  lineHeight: 1,
  paddingTop: 4,
  paddingBottom: 4
});

export const TimeLineChart = (props) => {
  const {
    datasets,
    length,
    labels,
    colors = [],
    title,
    stepTime,
    infoText
  } = props;
  const chartRef = React.useRef(null);
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const { t } = useTranslation();
  const [dataProcessor, setDataProcessor] = React.useState(PROCESSORS[0].value);

  const processedPoints = React.useMemo(() => {
    switch (dataProcessor) {
      case SAVGOL_SMOOTH.name:
        return datasets.map((points) => SAVGOL_SMOOTH.process(points, 9));
      default:
        return datasets;
    }
  }, [datasets, dataProcessor]);

  const tickLabels = React.useMemo(() => {
    const short = new Array(length);
    for (let i = 0; i < length; i++) {
      short[i] = Utils.formatDurationChartShort(stepTime * i);
    }
    return short;
  }, [length, stepTime]);

  const defaultColor = themeContext.isDark ? theme.palette.primary.dark : theme.palette.primary.light;
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
        dotIndicatorColor: colors[i] || defaultColor,
        dotIndicatorBgColor: 'white'
      }
    }),
  };

  const valToPercent = (val) => {
    return (100 * val).toFixed(0) + '%';
  };

  const options = {
    devicePixelRatio: 1.5,
    interaction: {
      mode: "interpolate",
      intersect: false,
      axis: "x"
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
            return valToPercent(t);
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return Utils.formatDurationChartLong(tooltipItems[0].label * stepTime);
          },
          label: (tooltipItem) => {
            return tooltipItem.dataset.label + ': ' + valToPercent(tooltipItem.formattedValue);
          },
          labelColor: function (tooltipItem) {
            return {
              backgroundColor: tooltipItem.dataset.backgroundColor
            }
          },
        }
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'line'
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
  }

  const resetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const changeProcessor = (event) => {
    setDataProcessor(event.target.value);
  };

  return (
    <Box >
      {/* control panel */}
      <Stack direction="row" gap={0.6} sx={{ justifyContent: 'right' }}>
        <Stack direction='row' gap={0.4} sx={{ flexGrow: 1 }}>
          <Typography variant="body1">
            {title}
          </Typography>
          {infoText && <InfoTextHelper text={infoText}/>}
        </Stack>
        <ChartButton onClick={resetZoom} variant='outlined'>
          {t('chartResetZoom')}
        </ChartButton>
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={dataProcessor}
          exclusive
          onChange={changeProcessor}
        >
          {PROCESSORS.map((processor, index) =>
            <ChartToggle key={index} value={processor.value}>
              {t(processor.label)}
            </ChartToggle>
          )}
        </ToggleButtonGroup>
        <InfoTextHelper text={
          <Typography variant="caption" sx={{ whiteSpace: 'pre-line'}}>
            {t('chartActionsDescription')}
          </Typography>
        } />
      </Stack>
      <Line
        ref={chartRef}
        options={options}
        data={data}
      />
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

