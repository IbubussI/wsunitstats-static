import {
  Chart as ChartJS,
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  ArcElement,
  Interaction
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

function getInterpolatedLabelAndValue(meta) {
  const pt = meta._pt;
  // default to this special value to be able to hide tooltip when in non-chart area
  let label = 'outOfScope';
  let value = '';
  if (pt) {
    const vScale = meta.vScale;
    const iScale = meta.iScale;
    value = vScale.getValueForPixel(pt.y);

    // find closest to the previous point
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

function getEventAreaLabelAndValue(meta) {
  const eventImgs = meta._eventItemsIntersected;
  const interpolatedLabelAndValue = getInterpolatedLabelAndValue(meta);
  return {
    label: interpolatedLabelAndValue.label,
    value: eventImgs
  };
}

// Override getLabelAndValue to return necessary for items for interctions
const getLabelAndValue = LineController.prototype.getLabelAndValue;
LineController.prototype.getLabelAndValue = function (index) {
  if (index === 'interpolate') {
    return getInterpolatedLabelAndValue(this.getMeta());
  } else if (index === 'eventArea') {
    return getEventAreaLabelAndValue(this.getMeta());
  }
  return getLabelAndValue.call(this, index);
};

// Interpolation interaction (e - cursor position)
// Idea is to save points for each metaset where x coord of cursor intersects them
// this points are returned for tooltip and can be used to e.g. draw dot indicator etc
Interaction.modes.interpolate = function (chart, e) {
  const x = e.x;
  const items = [];

  const metas = chart.getSortedVisibleDatasetMetas();
  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    const pt = meta.dataset.interpolate({ x }, 'x');
    if (pt && chart.isPointInArea(e)) {
      const element = new PointElement({
        ...pt, options: {}
      });
      meta._pt = element;
      items.push({ element: element, index: 'interpolate', datasetIndex: meta.index });
    } else {
      meta._pt = null;
    }
  }
  return items;
};

const InterpolatedPointStateCleanUp = {
  id: 'interpolatedPointStateCleanUp',
  afterEvent(chart, args) {
    // remove point when hovering out of chart area
    if (!args.inChartArea) {
      const metas = chart.getSortedVisibleDatasetMetas();
      for (let i = 0; i < metas.length; i++) {
        metas[i]._pt = null;
      }
      args.changed = true;
    }
  }
};

Interaction.modes.eventArea = function (chart, e) {
  const items = [];
  const metas = chart.getSortedVisibleDatasetMetas();
  const interpolatedItems = Interaction.modes.interpolate(chart, e);
  interpolatedItems.forEach((interpolatedItem) => {
    const meta = metas[interpolatedItem.datasetIndex];
    const intersectedItems = meta._eventItems?.filter(({ x, y, icon }) => {
      // check if cursor intersects event image
      const isYin = e.y >= y && e.y <= y + icon.height;
      const isXin = e.x >= x && e.x <= x + icon.width;
      return isXin && isYin;
    });
    meta._eventItemsIntersected = intersectedItems || [];
    items.push({ ...interpolatedItem, index: 'eventArea' });
  });
  return items;
};

Tooltip.positioners.cursor = function (_, coordinates) {
  return coordinates;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineController, LineElement,
  ArcElement, Tooltip, Legend, InterpolatedPointStateCleanUp, annotationPlugin);