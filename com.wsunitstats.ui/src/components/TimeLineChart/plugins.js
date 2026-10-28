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
