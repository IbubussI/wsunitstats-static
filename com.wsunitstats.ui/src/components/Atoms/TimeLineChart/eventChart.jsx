import * as React from 'react';
import * as Utils from 'utils/utils';
import './index.css';
import { Line } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  autocompleteClasses,
  Box,
  checkboxClasses,
  Modal,
  Paper,
  Stack,
  styled,
  useTheme,
} from '@mui/material';
import { ThemeContext } from 'themeContext';
import { resolveEndIcon, resolveIcon } from './chartIconResolver';
import { useChartState } from 'components/Hooks/useChartState';
import { ChartHead } from './chartHead';
import { endIcon, eventLabel, eventsPlugin, hideDatasets, vRuler } from './plugins';
import { clearElement, getChartFont, getDefaultOptions } from './helpers';
import { MultiSelect } from 'components/Atoms/MultiSelect';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

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

const EventFilterSelect = styled(MultiSelect)(({ theme }) => ({
  width: '180px',
  [`& .${autocompleteClasses.inputRoot}`]: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 0,
    paddingTop: '2px !important',
    paddingBottom: '2px !important',
    height: '100%'
  },
  [`& .${autocompleteClasses.input}`]: {
    paddingTop: '0px !important',
    paddingBottom: '0px !important'
  }
}));

const eventFilterOptionProps = {
  listbox: {
    sx: {
      [`& .${checkboxClasses.root}`]: {
        p: 0,
        ml: 0.75,
        borderRadius: 0,
        '&:hover': {
          backgroundColor: 'transparent !important'
        },
        '& svg': {
          fontSize: '1rem'
        }
      }
    },
  },
  popupIndicator: {
    disableRipple: true
  }
};

const EventChartContent = (props) => {
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
    isModalOpen,
    openModal,
    closeModal,
    events,
    eventTypes = [],
    eventFilterLabel
  } = props;
  const { t } = useTranslation();
  const chartRef = React.useRef(null);
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const xLength = React.useMemo(() => datasets.reduce((accum, dataset) => Math.max(accum, dataset.length), 0), [datasets]);
  const chartId = `${id}-chart`;
  const chartState = useChartState(chartRef, xLength, chartId);
  const {
    resetScale,
    tooltipOn
  } = chartState;
  const [currentDatasetEventTypes, setCurrentDatasetEventTypes] = React.useState(eventTypes);

  // Set original scale when data size changed
  React.useEffect(() => {
    resetScale();
    // added datasets to reset on chart change
  }, [resetScale, datasets]);

  const tickLabels = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < xLength; i++) {
      result[i] = Utils.formatDurationChartShort(stepTime * i);
    }
    return result;
  }, [stepTime, xLength]);

  const defaultColor = themeContext.isDark ? theme.palette.primary.dark : theme.palette.primary.light;
  const endImages = results.map((result) => resolveEndIcon(result, theme.palette.background.default));
  const eventsProcessed = React.useMemo(() => events.map(eventsInner =>
    eventsInner
      .filter(event => currentDatasetEventTypes.map(e => e.key).includes(event.type))
      .map(event => ({
        x: event.x,
        y: event.y,
        icon: resolveIcon(event.iconSrc, event.iconWidth, event.iconHeight),
        text: t(event.text),
        time: Utils.formatDurationChartLong(event.time)
      }))
  ), [events, currentDatasetEventTypes, t]);
  const datasetNum = datasetsVisible.filter(isVisible => isVisible).length;
  const mapPoints = (points, pointsIndex) => {
    const visibleNum = datasetsVisible.filter((isVisible, index) => isVisible && pointsIndex > index).length;
    // reverse order, so the first entry is on top
    return points.map(point => point * datasetNum - visibleNum);
  };
  const data = {
    labels: tickLabels,
    datasets: datasets.map((points, i) => ({
      label: labels[i],
      events: eventsProcessed[i],
      data: mapPoints(points, i),
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
      mode: 'eventArea',
      intersect: false,
      axis: 'x'
    };
    opts.scales.y = {
      stepSize: 0.1,
      suggestedMax: 1,
      min: 0.5,
      max: datasetNum + 0.75,
      ticks: {
        display: false,
      }
    };
    opts.plugins.tooltip = {
      enabled: false,
      external: eventTooltip(tooltipOn, chartId),
      position: 'cursor',
      intersect: false,
      titleMarginBottom: 0,
      filter: (item) => {
        // required to hide tooltip when hovering on axis ticks or other non-chart area items of canvas
        return item.label !== 'outOfScope';
      },
      callbacks: {
        title: (tooltipItems) =>
          tooltipItems.length ? Utils.formatDurationChartLong(tooltipItems[0].label * stepTime) : '',
        label: tooltipItem => ({ eventItems: tooltipItem.formattedValue, name: tooltipItem.dataset.label.name })
      }
    };
    opts.layout.padding.left = 24;
    return opts;
  }, [datasetNum, stepTime, tooltipOn, chartState, chartId]);

  return (
    <Stack sx={{ height: '100%' }}>
      <ChartHead
        isSmoothOn={false}
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
        }}>
        {eventTypes.length > 1 && <EventFilterSelect
          onChange={(newValues) => setCurrentDatasetEventTypes(newValues)}
          values={currentDatasetEventTypes}
          label={eventFilterLabel}
          options={eventTypes}
          size="small"
          displayTags={false}
          slotProps={eventFilterOptionProps}
          primaryFontSize={'body2'}
          selectAll
          disableClearable
          disableRipple
        />}
      </ChartHead>
      <Box sx={{ flexGrow: 1, height: (datasetNum + 1) * 38 }}>
        <Line
          id={chartId}
          ref={chartRef}
          options={options}
          data={data}
          plugins={[vRuler, endIcon, hideDatasets, zoomPlugin, eventsPlugin, eventLabel]}
        />
      </Box>
      {createPortal(
        <div id={`${chartId}-tooltip-root`} className="chart-tooltip-root" style={{ opacity: 0 }}>
          <div id={`${chartId}-tooltip-container`} className="chart-tooltip-container"></div>
          <div id={`${chartId}-tooltip-title`} className="chart-tooltip-title" style={{ font: getChartFont({ weight: 'bold' }) }}></div>
          {/* template elements to clone */}
          <div id={`${chartId}-tooltip-row`} className="chart-tooltip-row" style={{ display: 'none' }}></div>
          <div id={`${chartId}-tooltip-item`} className="chart-tooltip-item" style={{ display: 'none' }}>
            <img width="32" height="32" src='' alt=''></img>
            <p style={{ font: getChartFont({ weight: 'bold' }) }}></p>
            <p style={{ font: getChartFont({}) }}></p>
          </div>
        </div>,
        document.body
      )}
    </Stack>
  );
};

export const EventChart = (props) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const EventContent = <EventChartContent {...props} openModal={openModal} closeModal={closeModal} isModalOpen={modalOpen} />;
  return (
    <Box>
      {!modalOpen && EventContent}
      <Modal
        open={modalOpen}
        onClose={closeModal}
      >
        <ModalContent>
          {modalOpen && EventContent}
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ITEMS_PER_ROW = 3;
const eventTooltip = (enabled, chartId) => {
  return (context) => {
    const {
      chart,
      tooltip
    } = context;
    // Tooltip Element
    const tooltipEl = document.getElementById(`${chartId}-tooltip-root`);
    // Hide if no tooltip or no content to show
    if (tooltip.opacity === 0 || !enabled || !tooltip.title.length > 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    // Not used. No css classes defined for this. Carret position always the same
    // Set default class to cleanup old carret position
    //tooltipEl.className = 'chart-tooltip-root';
    // Set caret Position
    //tooltipEl.classList.add(`${tooltip.xAlign}-${tooltip.yAlign}`);

    // Add caret css
    tooltipEl.classList.add('arrow_box');

    // Set Content
    const title = tooltip.title[0];
    const datasetEvents = tooltip.body.map(b => b.lines[0]);
    const titleEl = document.getElementById(`${chartId}-tooltip-title`);
    titleEl.textContent = title;

    const containerEl = document.getElementById(`${chartId}-tooltip-container`);
    const rowId = `${chartId}-tooltip-row`;
    const rowRefEl = document.getElementById(rowId);
    const itemId = `${chartId}-tooltip-item`;
    const itemRefEl = document.getElementById(itemId);
    clearElement(containerEl);
    datasetEvents
      .filter(datasetEvent => datasetEvent.eventItems.length > 0)
      .forEach((datasetEvent) => {
        const events = datasetEvent.eventItems;
        const rows = Math.floor(events.length / ITEMS_PER_ROW) + 1;
        const rowElements = [];
        for (let i = 0; i < rows; i++) {
          const rowEl = rowRefEl.cloneNode();
          rowEl.style.display = 'flex';
          rowEl.id = rowId + '-' + i;
          containerEl.appendChild(rowEl);
          rowElements.push(rowEl);
        }

        events.forEach((eventItem, index) => {
          const rowIndex = Math.floor(index / ITEMS_PER_ROW);
          const rowEl = rowElements[rowIndex];

          const itemEl = itemRefEl.cloneNode(true);
          itemEl.style.display = 'flex';
          itemEl.id = itemId + '-' + index;
          rowEl.appendChild(itemEl);

          const imgEl = itemEl.children[0];
          const timeParEl = itemEl.children[1];
          const nameParEl = itemEl.children[2];

          imgEl.src = eventItem.icon.src;
          timeParEl.appendChild(document.createTextNode(eventItem.time));
          nameParEl.appendChild(document.createTextNode(eventItem.text));
        });
      });
    containerEl.style.display = containerEl.hasChildNodes() ? 'flex' : 'none';

    const position = chart.canvas.getBoundingClientRect();

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = position.left + window.pageXOffset + tooltip.caretX + 'px';
    tooltipEl.style.top = position.top + window.pageYOffset + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.padding + 'px ' + tooltip.padding + 'px';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.transform = 'translate(-50%, 0) translate(0, 8px)';
  }
};
