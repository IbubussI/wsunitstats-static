export function expDecay(Q, rate, time) {
  return Q*(Math.exp(-rate*time));
}

// returns area under function curve given as a set of points in dataset
// stepSize can be used to scale calculation
export function calcArea(dataset, stepSize = 1) {
  let area = 0;
  for (var i = 1; i < dataset.length; i++) {
    area += 0.5 * stepSize * (dataset[i] + dataset[i - 1]);
  }
  return area;
}

// returns area under function curve given as a set of points in dataset
// stepSize can be used to scale calculation
export function calcAvg(dataset, stepSize = 1) {
  let sum = 0;
  for (var i = 0; i < dataset.length; i++) {
    sum += dataset[i];
  }
  return sum / dataset.length;
}

