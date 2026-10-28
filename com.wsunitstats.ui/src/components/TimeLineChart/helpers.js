import { defaults } from 'chart.js';

export const getChartFont = (props) => {
  const defFont = defaults.font;
  const style = props.style || defFont.style;
  const size = props.size || defFont.size;
  const lineHeight = props.lineHeight || defFont.lineHeight;
  const weight = props.weight || defFont.weight || '';
  const family = props.family || defFont.family;
  return `${style} ${weight} ${size}px/${lineHeight} ${family}`;
};

export const getDefaultOptions = (
  {
    applyZoom,
    scaleLimits,
    setScaleLimits,
    originalScaleLimits,
    cursorMode
  }
) => ({
  devicePixelRatio: 1.5,
  maintainAspectRatio: false,
  onClick(event, _, chart) {
    applyZoom(event, chart);
  },
  layout: {
    padding: {
      right: 24
    }
  },
  scales: {
    x: {
      min: scaleLimits.min,
      max: scaleLimits.max,
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        callback: function (val, _, ticks) {
          const density = Math.trunc(ticks.length / 12) || 1;
          return val % density === 0 && val % 2 === 0 ? this.getLabelForValue(val) : null;
        }
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
        onPanStart({ chart }) {
          chart.canvas.style.cursor = 'grabbing';
        },
        onPanComplete({ chart }) {
          chart.canvas.style.cursor = cursorMode;
          setScaleLimits(chart.getZoomedScaleBounds().x);
        }
      },
      limits: {
        x: {
          minRange: 5,
          ...originalScaleLimits
        },
      }
    }
  }
});

export const clearElement = (el) => {
  while (el.firstChild) {
    el.removeChild(el.lastChild);
  }
};
