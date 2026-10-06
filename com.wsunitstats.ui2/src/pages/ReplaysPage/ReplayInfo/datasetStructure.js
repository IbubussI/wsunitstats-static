export class DatasetContainer {
  containerName; // Army Score, Kill Score etc
  containerType;
  containerDescription;
  valueType;
  datasetGroups = [];

  constructor(locKeyPrefix, valueType = 'num', containerType = 'points', eventTypes = null) {
    this.containerName = locKeyPrefix + 'Name';
    this.containerType = containerType;
    this.containerDescription = locKeyPrefix + 'Description';
    this.valueType = valueType;
    // possible events type list
    if (containerType === 'events' && eventTypes) {
      this.eventTypes = eventTypes;
      this.eventFilterLabel = locKeyPrefix + 'FiltersLabel';
    }
  }

  addDatasetGroup(datasetGroup) {
    this.datasetGroups.push(datasetGroup);
  }
}

// container for datasets whith multiple rows (e.g. for all 3 resources in one dataset)
export class MultiRowDatasetContainer extends DatasetContainer {
  rowNum;
  rowNames;
  isLocalizeRowNames;
  rowColors;
  rowIcons;

  constructor(locKeyPrefix, rowNum, rowNames, rowColors, rowIcons, isLocalizeRowNames = true, valueType = 'num') {
    super(locKeyPrefix, valueType);
    this.containerType = 'multiRow';
    this.rowNum = rowNum;
    this.rowNames = rowNames;
    this.rowColors = rowColors;
    this.rowIcons = rowIcons;
    this.isLocalizeRowNames = isLocalizeRowNames;
  }
}

export class DatasetGroup {
  dataGroupIdentifier;
  dataGroupName; // Teams, Squads, Players etc
  defaultValues; // datasets selected by default
  datasets = [];

  constructor(name, identifier, defaultValues) {
    this.dataGroupName = name;
    this.dataGroupIdentifier = identifier;
    this.defaultValues = new Set(defaultValues);
  }

  addDataset(dataset) {
    this.datasets.push(dataset);
  }
}

class BaseDataset {
  values = [0]; // value objects (0 here is for the 0 point on timeline, as it is not captured)
  datasetName; // team-name, squad-name, player-name etc
  isLocalizeName;
  localizationDynamicValue;
  result; // string that represents icon at the end of dataset
  color; // color of dataset

  constructor(name, isLocalizeName, localizationDynamicValue, result, color) {
    this.datasetName = name;
    this.isLocalizeName = isLocalizeName;
    this.localizationDynamicValue = localizationDynamicValue;
    this.result = result;
    this.color = color;
  }
}

export class TimeLineDataset extends BaseDataset {
  valuesComputed = []; // number of values processed to compute value at the same index in 'vales' array (to handle e.g. team avg correctly)
  maxSize;
  pointsSum = 0;
  pointsAvgLocal = 0; // local - within entity lifetime (e.g. to player survivalTime)
  pointsAvgGlobal = 0; // global - within match duration
  // points with weight function applied
  pointsSumK = 0;
  pointsAvgLocalK = 0;
  pointsAvgGlobalK = 0;
  min = Number.MAX_VALUE;
  max = Number.MIN_VALUE;

  constructor(name, isLocalizeName, localizationDynamicValue, result, color, timeLineLength, kFunc) {
    super(name, isLocalizeName, localizationDynamicValue, result, color);
    this.kFunc = kFunc;
    this.maxSize = timeLineLength;
  }

  // add value to this dataset tracking its min/max/avg/sum
  push(value, time) {
    this.values.push(value);
    this.valuesComputed.push(1);

    this.calcTrackingFeatures(value, this.values.length, time);
  }

  // compute new value based on previous one
  compute(index, computeFunc, time) {
    index++; // first value is always 0, shift other values by 1
    const arrVal = this.values[index];
    const arrComputedVal = this.valuesComputed[index];
    const currentValue = arrVal != null ? arrVal : 0;
    const computedValues = arrComputedVal != null ? arrComputedVal : 0;
    const value = computeFunc(currentValue, computedValues);
    this.values[index] = value;
    this.valuesComputed[index] = computedValues + 1;

    this.calcTrackingFeatures(value, this.values.length, time);
  }

  computeAvg(index, value, time) {
    this.compute(index, (curr, total) => (curr * total + value)/(total + 1), time);
  }

  computeSum(index, value, time) {
    this.compute(index, (curr) => curr + value, time);
  }

  calcTrackingFeatures(value, length, time) {
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
    this.pointsSum = this.pointsSum + value;
    this.pointsAvgLocal = this.pointsSum / length;
    this.pointsAvgGlobal = this.pointsSum / this.maxSize;

    if (this.kFunc && time) {
      this.pointsSumK = this.pointsSumK + this.kFunc(value, time);
      this.pointsAvgLocalK = this.pointsSumK / length;
      this.pointsAvgGlobalK = this.pointsSumK / this.maxSize;
    }
  }
}

// extends dataset with 2d array of values to support
export class TimeLineMultiRowDataset extends TimeLineDataset {
  constructor(name, isLocalizeName, localizationDynamicValue, result, rowNum, timeLineLength) {
    super(name, isLocalizeName, localizationDynamicValue, result, null, timeLineLength);
    this.values = Array.from(Array(rowNum), _ => []);
    this.valuesComputed = Array.from(Array(rowNum), _ => []);
  }

  // add values to each row tracking min/max/avg/sum
  push(values) {
    this.#checkIntegrity(values);
    values.forEach((value, row) => {
      this.values[row].push(value);
      this.valuesComputed[row].push(1);
      this.calcTrackingFeatures(value, this.values[row].length);
    });
  }

  // compute new value based on previous one
  compute(index, computeFunc) {
    index++; // first value is always 0, shift other values by 1
    const currentValue = this.values.map(row => row[index] != null ? row[index] : 0);
    const computedValues = this.valuesComputed.map(row => row[index] != null ? row[index] : 0);
    const values = computeFunc(currentValue, computedValues);
    this.#checkIntegrity(values);
    values.forEach((value, row) => {
      this.values[row][index] = value;
      this.valuesComputed[row][index] = computedValues[row] + 1;
      this.calcTrackingFeatures(value, this.values[row].length);
    });
  }

  computeAvg(index, values) {
    this.compute(index, (currValues, totalValues) =>
      currValues.map((curr, i) => {
        const total = totalValues[i];
        return (curr * total + values[i]) / (total + 1);
      }));
  }

  computeSum(index, values) {
    this.compute(index, (currValues) => currValues.map((curr, i) => curr + values[i]));
  }

  #checkIntegrity(values) {
    if (values.length !== this.values.length) {
      throw new Error(`Given values length ${values.length} should match with row number ${this.values.length} in this dataset`);
    }
  }
}

export class TimeLineEventDataset extends BaseDataset {
  events = [];

  constructor(name, isLocalizeName, localizationDynamicValue, result, color) {
    super(name, isLocalizeName, localizationDynamicValue, result, color);
    this.values = [1];
  }

  push(events) {
    this.events.push(...events);
    this.values.push(1);
  }
}

export class TimeLineEvent {
  text;
  type;
  iconSrc;
  iconWidth;
  iconHeight;
  x;
  time;

  constructor(text, type, iconSrc, iconWidth, iconHeight, x, time) {
    this.text = text;
    this.type = type;
    this.iconSrc = iconSrc;
    this.iconWidth = iconWidth;
    this.iconHeight = iconHeight;
    this.x = x;
    this.time = time;
  }
}
