import savitzkyGolay from 'ml-savitzky-golay';
import * as React from 'react';

const SMOOTH_MIN = 0;
const SMOOTH_MAX = 15;
const SMOOTH_DEFAULT = 3;
const ZOOM_IN_STEP = 0.3;
const ZOOM_OUT_STEP = 0.6;
const ZOOM_MIN = 4;

/**
 * Controller for chart tools
 */
export function useChartState(chartRef, xLength, chartId) {
  const [smoothLevel, setSmoothLevel] = React.useState(SMOOTH_DEFAULT);
  const [tooltipOn, setTooltipOn] = React.useState(true);
  const originalScaleLimits = React.useMemo(() => ({ min: 0, max: xLength - 1 }), [xLength]);
  const [scaleLimits, setScaleLimits] = React.useState(originalScaleLimits);
  const [cursorMode, setCursorMode] = React.useState(null);
  const zoomInButtonId = `zoom-in-button-${chartId}`;

  // listen for clicks to reset zoom mode when out of chart
  React.useEffect(() => {
    const resetZoomMode = (event) => {
      const chart = chartRef.current;
      const eventNode = event.target;
      const zoomInButton = document.getElementById(zoomInButtonId);
      const isZoomInButton = zoomInButton?.contains(eventNode);
      if (chart && event.target.id !== chartId && !isZoomInButton) {
        setCursorMode(null);
        chart.canvas.style.cursor = 'auto';
      }
    };

    window.addEventListener('mousedown', resetZoomMode);
    return () => {
      window.removeEventListener('mousedown', resetZoomMode);
    };
  }, [chartId, zoomInButtonId, chartRef]);

  const smooth = React.useCallback((points) => {
    if (smoothLevel === 0) {
      // no-smooth
      return points;
    }
    const wSize = 2 * Math.ceil(Math.exp(smoothLevel * 6 / SMOOTH_MAX)) + 3;
    return savitzkyGolay(points, 1, { derivative: 0, windowSize: wSize, pad: 'pre', polynomial: 3 })
      .map(point => point > 0 ? point : 0);
  }, [smoothLevel]);

  const resetScale = React.useCallback(() => {
    setScaleLimits(originalScaleLimits);
  }, [originalScaleLimits]);

  const zoomFunc = React.useCallback((ratio, step, rightFunc, leftFunc) => {
    const scaleWidth = scaleLimits.max - scaleLimits.min + 1;
    // original values
    let left = Math.floor(scaleWidth * ratio);
    let right = scaleWidth - left;
    // scaled to step values
    left = Math.ceil(step * left);
    right = Math.ceil(step * right);
    // closest even numbers (to always have limit ticks on the scale)
    left -= left % 2;
    right += right % 2;
    // calc new limits
    const newLimits = {
      max: Math.min(originalScaleLimits.max, rightFunc(scaleLimits.max, right)),
      min: Math.max(originalScaleLimits.min, leftFunc(scaleLimits.min, left))
    };
    // apply minimal zoom boundary
    if (newLimits.max - newLimits.min > ZOOM_MIN) {
      setScaleLimits(newLimits);
    }
  }, [originalScaleLimits, scaleLimits]);

  const zoomOut = React.useCallback(() => {
    zoomFunc(0.5, ZOOM_OUT_STEP, (curr, d) => curr + d, (curr, d) => curr - d);
  }, [zoomFunc]);

  const zoomIn = React.useCallback((width, event) => {
    // left|right zoom ratio
    const ratio = event.x / width;
    zoomFunc(ratio, ZOOM_IN_STEP, (curr, d) => curr - d, (curr, d) => curr + d);
  }, [zoomFunc]);

  const applyZoom = React.useCallback((event, chart) => {
    if (cursorMode === 'zoom-in') {
      zoomIn(chart.width, event);
    }
  }, [zoomIn, cursorMode]);

  const updateCursorMode = React.useCallback((state, cursor) => {
    const chart = chartRef.current;
    if (chart) {
      if (cursorMode === state) {
        chart.canvas.style.cursor = 'unset';
        setCursorMode(null);
      } else {
        chart.canvas.style.cursor = cursor;
        setCursorMode(state);
      }
    }
  }, [chartRef, cursorMode]);

  return {
    cursorMode,
    updateCursorMode,
    zoomOut,
    zoomInButtonId,
    applyZoom,
    scaleLimits,
    resetScale,
    setScaleLimits,
    originalScaleLimits,
    smooth: {
      smooth,
      level: smoothLevel,
      setLevel: setSmoothLevel,
      min: SMOOTH_MIN,
      max: SMOOTH_MAX
    },
    tooltipOn,
    setTooltipOn
  }
};
