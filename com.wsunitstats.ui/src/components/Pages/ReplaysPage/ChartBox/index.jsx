import { Stack, Typography } from '@mui/material';
import { MultiSelect } from 'components/Atoms/MultiSelect';
import { SingleSelect } from 'components/Atoms/SingleSelect';
import { EventChart, TimeLineChart } from 'components/Atoms/TimeLineChart';
import { isEqual } from 'lodash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const VALUE_TRANSFORMERS = {
  percent: (val) => (100 * val).toFixed(0) + '%'
};

export const ChartBox = ({ id, timeLine, stepTime, restrictByGroupName, restrictByDatasetIndex }) => {
  const { t } = useTranslation();
  const [currentDatasetContainerIndex, setCurrentDatasetContainerIndex] = React.useState(0);
  const [currentDatasetGroupIndex, setCurrentDatasetGroupIndex] = React.useState(0);
  const datasetContainer = timeLine[currentDatasetContainerIndex];
  const containerType = datasetContainer.containerType;
  const isMultiRow = containerType === 'multiRow';

  const datasetContainerOptions = React.useMemo(() =>
    timeLine.map((datasetContainer, index) => ({ name: t(datasetContainer.containerName), index: index })),
    [timeLine, t]);

  const filterDatasetGroups = React.useCallback((datasetContainer) =>
    datasetContainer.datasetGroups.filter((datasetGroup) => restrictByGroupName == null || datasetGroup.dataGroupName === restrictByGroupName),
    [restrictByGroupName]);
  const filteredDatasetGroups = React.useMemo(() => filterDatasetGroups(datasetContainer), [datasetContainer, filterDatasetGroups]);

  const datasetGroup = filteredDatasetGroups[currentDatasetGroupIndex];

  const datasetGroupOptions = React.useMemo(() =>
    filteredDatasetGroups.map((datasetGroup, index) => ({ name: t(datasetGroup.dataGroupName), id: datasetGroup.dataGroupIdentifier, index: index })),
    [filteredDatasetGroups, t]);

  const currentDatasetGroupOption = datasetGroupOptions[currentDatasetGroupIndex];
  const currentDatasetContainerOption = datasetContainerOptions[currentDatasetContainerIndex];

  const filterDatasetObjects = React.useCallback((datasetGroup) =>
    datasetGroup.datasets.filter((_, index) => restrictByDatasetIndex == null || restrictByDatasetIndex === index),
    [restrictByDatasetIndex]);
  const filteredDatasetObjects = React.useMemo(() => filterDatasetObjects(datasetGroup), [datasetGroup, filterDatasetObjects]);
  const datasetOptions = React.useMemo(() =>
    filteredDatasetObjects.map((dataset, index) => {
      const localized = () => dataset.localizationDynamicValue != null ? t(dataset.datasetName, { value: dataset.localizationDynamicValue }) : t(dataset.datasetName);
      return {
        name: dataset.isLocalizeName ? localized() : dataset.datasetName,
        index: index
      };
    }),
    [filteredDatasetObjects, t]);
  const valueType = datasetContainer.valueType;
  const valTransformer = valueType && VALUE_TRANSFORMERS[valueType];
  const chartDescription = t(datasetContainer.containerDescription);
  
  const getDefaultDatasets = (group, objects, isMultiRow) => objects.map((_, index) => {
    const defValues = group.defaultValues;
    return defValues.size > 0 ? defValues.has(index) : (isMultiRow && index !== 0 ? false : true);
  });
  // array of true - visible, false - hidden datasets (index of array === index of dataset)
  // only one option is possible to select in multi-row mode
  const [currentDatasets, setCurrentDatasets] = React.useState(() => getDefaultDatasets(datasetGroup, filteredDatasetObjects, isMultiRow));
  const currentDatasetOptions = datasetOptions.filter(option => currentDatasets[option.index]);
  const chartDatasetOptions = isMultiRow ? Array(datasetContainer.rowNum).fill(true) : currentDatasets;
  const datasets = React.useMemo(() => {
    if (isMultiRow) {
      return currentDatasetOptions.length > 0 ? filteredDatasetObjects[currentDatasetOptions[0].index].values : [];
    } else {
      return filteredDatasetObjects.map(datasetObject => datasetObject.values);
    }
  }, [filteredDatasetObjects, currentDatasetOptions, isMultiRow]);

  const results = React.useMemo(() => {
    if (isMultiRow) {
      return datasetContainer.rowIcons;
    } else {
      return filteredDatasetObjects.map(datasetObject => datasetObject.result);
    }
  }, [filteredDatasetObjects, isMultiRow, datasetContainer.rowIcons]);

  const colors = React.useMemo(() => {
    if (isMultiRow) {
      return datasetContainer.rowColors;
    } else {
      return filteredDatasetObjects.map(datasetObject => datasetObject.color);
    }
  }, [filteredDatasetObjects, datasetContainer, isMultiRow]);

  const labels = React.useMemo(() => {
    let labelNames;
    if (isMultiRow) {
      labelNames = datasetContainer.isLocalizeRowNames ? datasetContainer.rowNames.map(name => t(name)) : datasetContainer.rowNames;
    } else {
      labelNames = datasetOptions.map(option => option.name);
    }
    return labelNames.map((labelName, index) => ({ name: labelName, id: index }))
  }, [datasetOptions, datasetContainer, isMultiRow, t]);

  const updateDatasets = (newValue) => {
    if (Array.isArray(newValue)) {
      setCurrentDatasets(datasetOptions.map((_, index) => newValue.some(opt => opt.index === index)));
    } else {
      setCurrentDatasets(datasetOptions.map((_, index) => newValue.index === index));
    }
  };

  // event-specific
  const isEvents = containerType === 'events';
  const eventTypes = React.useMemo(() => {
    return datasetContainer.eventTypes?.map((eventType) => ({ name: t(eventType), key: eventType }));
  }, [datasetContainer, t]);
  const events = React.useMemo(() => {
    return filteredDatasetObjects.map(datasetObject => datasetObject.events)
  }, [filteredDatasetObjects]);

  const commonProps = {
    id,
    datasets,
    datasetsVisible: chartDatasetOptions,
    labels,
    title: currentDatasetContainerOption.name,
    results,
    stepTime,
    colors,
    valTransformer,
    infoText: !chartDescription.startsWith('replayDataset') ?
      <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
        {chartDescription}
      </Typography>
      : undefined
  };

  return (
    <Stack gap={1}>
      <Stack gap={1} direction="row" sx={{ pt: 1, justyfyContent: 'center', flexWrap: 'wrap', }}>
        {datasetContainerOptions.length > 1 && <SingleSelect
          sx={{ minWidth: 240 }}
          onChange={(option) => {
            setCurrentDatasetContainerIndex(option.index);
            // select default option instead of current one if it is not present
            const newContainer = timeLine[option.index];
            const newIndex = newContainer.datasetGroups.findIndex(newDatasetGroup => newDatasetGroup.dataGroupIdentifier === currentDatasetGroupOption.id);
            const newGroups = filterDatasetGroups(newContainer);
            const newGroupIndex = newIndex >= 0 && newGroups[newIndex] != null ? newIndex : 0;
            setCurrentDatasetGroupIndex(newGroupIndex);

            const newGroup = newGroups[newGroupIndex];
            const newObjects = filterDatasetObjects(newGroup);
            if (!isEqual(filteredDatasetObjects.map(object => object.datasetName), newObjects.map(object => object.datasetName))) {
              setCurrentDatasets(getDefaultDatasets(newGroup, newObjects, newContainer.containerType === 'multiRow'));
            }
          }}
          value={currentDatasetContainerOption}
          options={datasetContainerOptions}
          label={t('chartBoxDatasetContainerSelectLabel')}
          size="small"
        />}
        {datasetGroupOptions.length > 1 && <SingleSelect
          sx={{ minWidth: 240 }}
          onChange={(option) => {
            setCurrentDatasetGroupIndex(option.index);
            // select default options in newly selected group
            const newGroup = filteredDatasetGroups[option.index];
            const newObjects = filterDatasetObjects(newGroup);
            setCurrentDatasets(getDefaultDatasets(newGroup, newObjects));
          }}
          value={currentDatasetGroupOption}
          options={datasetGroupOptions}
          label={t('chartBoxDatasetGroupSelectLabel')}
          size="small"
        />}
        {datasetOptions.length > 1 && <DatasetSelector
          sx={{ flexGrow: 1 }}
          onChange={updateDatasets}
          values={currentDatasetOptions}
          options={datasetOptions}
          label={t(datasetGroup.dataGroupName)}
          size="small"
          isMultiSelect={!isMultiRow}
        />}
      </Stack>

      {isEvents
        ? <EventChart
          {...commonProps}
          events={events}
          eventTypes={eventTypes}
          eventFilterLabel={t(datasetContainer.eventFilterLabel)}
        />
        : <TimeLineChart {...commonProps} />}
      
    </Stack>
  );
};

const DatasetSelector = (props) => {
  const {
    values,
    isMultiSelect,
    ...frowardedProps
  } = props;
  if (isMultiSelect) {
    return (
      <MultiSelect
        {...frowardedProps}
        values={values}
        limitTags={1}
        selectAll
      />
    );
  } else {
    return (
      <SingleSelect
        {...frowardedProps}
        value={values[0]}
      />
    );
  }
};
