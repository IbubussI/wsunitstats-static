export function expDecay(Q: number, rate: number, time: number) {
  return Q*(Math.exp(-rate*time));
}

// returns area under function curve given as a set of points in dataset
// stepSize can be used to scale calculation
export function calcArea(dataset: number[], stepSize = 1) {
  let area = 0;
  for (let i = 1; i < dataset.length; i++) {
    area += 0.5 * stepSize * (dataset[i] + dataset[i - 1]);
  }
  return area;
}

// returns average of the points in dataset
export function calcAvg(dataset: number[]) {
  let sum = 0;
  for (let i = 0; i < dataset.length; i++) {
    sum += dataset[i];
  }
  return sum / dataset.length;
}
