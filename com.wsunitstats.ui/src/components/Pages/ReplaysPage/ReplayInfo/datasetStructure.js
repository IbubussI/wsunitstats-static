export class DatasetContainer {
  containerName; // Army Score, Kill Score etc
  containerDescription;
  valueType;
  datasetGroups = [];

  constructor(locKeyPrefix, valueType = 'num') {
    this.containerName = locKeyPrefix + 'Name';
    this.containerDescription = locKeyPrefix + 'Description';
    this.valueType = valueType;
  }

  addDatasetGroup(datasetGroup) {
    this.datasetGroups.push(datasetGroup);
  }
}

export class DatasetGroup {
  dataGroupName; // Teams, Squads, Players etc
  datasets = [];

  constructor(name) {
    this.dataGroupName = name;
  }

  addDataset(dataset) {
    this.datasets.push(dataset);
  }
}

export class TimeLineDataset {
  values = [];
  valuesComputed = []; // number of values processed to compute value at the same index in 'vales' array
  datasetName; // team-name, squad-name, player-name etc
  isLocalizeName;
  localizationDynamicValue;
  result; // 'win', 'death', 'timeout' strings
  color;
  pointsSum = 0;
  pointsAvg = 0;
  min = Number.MAX_VALUE;
  max = Number.MIN_VALUE;

  constructor(name, isLocalizeName, localizationDynamicValue, result, color) {
    this.datasetName = name;
    this.isLocalizeName = isLocalizeName;
    this.localizationDynamicValue = localizationDynamicValue;
    this.result = result;
    this.color = color;
  }

  // add value to this dataset tracking its min/max/avg/sum
  push(value) {
    this.values.push(value);
    this.valuesComputed.push(1);
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
    this.pointsSum = this.pointsSum + value;
    this.pointsAvg = this.pointsSum / this.values.length;
  }

  // compute new value based on previous one
  compute(index, computeFunc) {
    const arrVal = this.values[index];
    const arrComputedVal = this.valuesComputed[index];
    const currentValue = arrVal != null ? arrVal : 0;
    const computedValues = arrComputedVal != null ? arrComputedVal : 0;
    const value = computeFunc(currentValue, computedValues);
    this.values[index] = value;
    this.valuesComputed[index] = computedValues + 1;
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
    this.pointsSum = this.pointsSum + value;
    this.pointsAvg = this.pointsSum / this.values.length;
  }

  computeAvg(index, value) {
    this.compute(index, (curr, total) => (curr * total + value)/(total + 1))
  }

  computeSum(index, value) {
    this.compute(index, (curr) => curr + value);
  }
}
