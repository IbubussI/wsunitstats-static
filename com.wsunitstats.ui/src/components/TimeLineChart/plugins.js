import { defaults, PointElement } from "chart.js";
import { getChartFont } from "./helpers";

export const vRuler = {
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
  afterDatasetsDraw: (chart, _, opts) => {
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

export const dotIndicator = {
  id: 'dotIndicator',
  afterDatasetsDraw(chart) {
    // draw point markers
    const metas = chart.getSortedVisibleDatasetMetas();
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const pt = meta._pt;
      if (pt) {
        new PointElement({
          x: pt.x, y: pt.y, options: {
            borderColor: meta._dataset.dotIndicatorColor,
            backgroundColor: meta._dataset.dotIndicatorBgColor,
            radius: 4,
            borderWidth: 2
          }
        }).draw(chart.ctx);
      }
    }
  }
};

export const endIcon = {
  id: 'endIcon',
  afterDatasetsDraw(chart) {
    const metas = chart.getSortedVisibleDatasetMetas();
    const { ctx } = chart;
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const last = meta.data[meta.data.length - 1];
      const endImg = meta._dataset.endIcon;
      if (endImg != null && last != null) {
        const imgWidth = endImg.width || 12;
        const imgHeight = endImg.height || 12;
        const imgX = last.x - imgWidth / 2;
        const imgY = last.y - imgHeight / 2;
        if (chart.isPointInArea(last)) {
          ctx.drawImage(endImg, imgX, imgY, imgWidth, imgHeight);
        }
      }
    }
  }
};

export const eventsPlugin = {
  id: 'events',
  afterDatasetsDraw(chart) {
    const metas = chart.getSortedVisibleDatasetMetas();
    const { ctx } = chart;
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];

      const events = meta._dataset.events;
      if (events != null) {
        const eventItems = [];
        events.forEach(event => {
          // normally any line chart should contain at least 2 points
          // so this check theoretically could be omitted
          if (meta.data.length < 2) {
            return;
          }

          const dataX = Math.floor(event.x);
          const offset = event.x - dataX;
          const point = meta.data[dataX];
          const stepSize = meta.data[1].x - meta.data[0].x;
          const x = point.x + offset * stepSize;
          const y = point.y;
          const imgWidth = event.icon.width;
          const imgHeight = event.icon.height;
          const imgX = x - imgWidth / 2;
          const imgY = y - imgHeight / 2;

          if (chart.isPointInArea({ x, y })) {
            ctx.drawImage(event.icon, imgX, imgY, imgWidth, imgHeight);
            eventItems.push({ ...event, x: imgX, y: imgY });
          }
        });
        meta._eventItems = eventItems;
      }
    }

    if (chart.options.animation === false) {
      chart.options.animation = true;
    }
  }
};

export const eventLabel = {
  id: 'eventLabel',
  afterDatasetsDraw(chart) {
    const metas = chart.getSortedVisibleDatasetMetas();
    const { ctx } = chart;
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const y = meta.data[0].y;
      const labelObj = meta._dataset.label;
      ctx.save();
      ctx.font = getChartFont({});
      ctx.fillStyle = defaults.color;
      ctx.fillText(labelObj.name, chart.chartArea.left + 10, y - 15);
      ctx.restore();
    }
  }
};

export const hideDatasets = {
  id: 'hideDatasets',
  beforeUpdate(chart) {
    chart.data.datasets.forEach((dataset, i) =>
      chart.setDatasetVisibility(i, dataset.visible));
  }
};

const MARKER_COLORS = { in: '#2e7d32', out: '#c62828' };
const MARKER_RADIUS = 5;

/**
 * Marks on the lines (dataset `markers`: [{ id, x, kind: 'in' | 'out', text }], x in data indexes):
 * a triangle pointing up for incoming, down for outgoing. The drawn marks are kept for the tooltip
 */
export const lineMarkers = {
  id: 'lineMarkers',
  afterDatasetsDraw(chart) {
    const metas = chart.getSortedVisibleDatasetMetas();
    for (const meta of metas) {
      const markers = meta._dataset.markers;
      meta._markerItems = [];
      if (!markers?.length || meta.data.length < 2) {
        continue;
      }
      const lastX = meta.data.length - 1;
      for (const marker of markers) {
        if (marker.x > lastX) {
          continue;
        }
        const x = meta.iScale.getPixelForValue(marker.x);
        const point = meta.dataset.interpolate({ x }, 'x');
        const y = point ? point.y : meta.vScale.getPixelForValue(0);
        if (!chart.isPointInArea({ x, y })) {
          continue;
        }
        new PointElement({
          x, y, options: {
            pointStyle: 'triangle',
            rotation: marker.kind === 'out' ? 180 : 0,
            radius: MARKER_RADIUS,
            backgroundColor: MARKER_COLORS[marker.kind],
            borderColor: 'white',
            borderWidth: 1
          }
        }).draw(chart.ctx);
        meta._markerItems.push({ ...marker, px: x });
      }
    }
  }
};

/** Texts of the drawn marks within the distance from the cursor (horizontally), each mark once */
export const getHoveredMarkerTexts = (chart, distance) => {
  const cursorX = chart._interactionX;
  if (cursorX == null) {
    return [];
  }
  const items = new Map();
  for (const meta of chart.getSortedVisibleDatasetMetas()) {
    for (const item of meta._markerItems ?? []) {
      if (Math.abs(item.px - cursorX) <= distance && !items.has(item.id)) {
        items.set(item.id, item);
      }
    }
  }
  return [...items.values()].sort((a, b) => a.x - b.x).map(item => item.text);
};
