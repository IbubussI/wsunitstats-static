function getAgeFactionIndustrial(researchesState, default_) {
  if (isResearchComplete(researchesState, 93)) { return [6, 8]; }
  if (isResearchComplete(researchesState, 59)) { return [5, 8]; }
  if (isResearchComplete(researchesState, 114)) { return [6, 9]; }
  if (isResearchComplete(researchesState, 64)) { return [5, 9]; }
  if (isResearchComplete(researchesState, 115)) { return [6, 10]; }
  if (isResearchComplete(researchesState, 68)) { return [5, 10]; }
  if (isResearchComplete(researchesState, 116)) { return [6, 11]; }
  if (isResearchComplete(researchesState, 67)) { return [5, 11]; }
  if (isResearchComplete(researchesState, 118)) { return [6, 12]; }
  if (isResearchComplete(researchesState, 63)) { return [5, 12]; }
  if (isResearchComplete(researchesState, 121)) { return [6, 13]; }
  if (isResearchComplete(researchesState, 65)) { return [5, 13]; }
  if (isResearchComplete(researchesState, 125)) { return [6, 14]; }
  if (isResearchComplete(researchesState, 62)) { return [5, 14]; }
  if (isResearchComplete(researchesState, 126)) { return [6, 15]; }
  if (isResearchComplete(researchesState, 70)) { return [5, 15]; }
  if (isResearchComplete(researchesState, 131)) { return [6, 16]; }
  if (isResearchComplete(researchesState, 73)) { return [5, 16]; }
  if (isResearchComplete(researchesState, 135)) { return [6, 17]; }
  if (isResearchComplete(researchesState, 72)) { return [5, 17]; }
  if (isResearchComplete(researchesState, 136)) { return [6, 18]; }
  if (isResearchComplete(researchesState, 61)) { return [5, 18]; }
  if (isResearchComplete(researchesState, 145)) { return [6, 19]; }
  if (isResearchComplete(researchesState, 69)) { return [5, 19]; }
  if (isResearchComplete(researchesState, 146)) { return [6, 20]; }
  if (isResearchComplete(researchesState, 71)) { return [5, 20]; }
	return [4, default_];
}

/**
 * taken from game mod 6gqH17D5rDl_3-66b5429af54002fc.lua
 * @param time ms from match start
 * @param researchTimeLine list of player research timeline
 * @returns array: [age, nation]
 */
export default function getAgeNation(time, researchTimeLine) {
  const researchesState = { time: time, researchTimeLine: researchTimeLine };
  if (isResearchComplete(researchesState, 3)) {
		if (!isResearchComplete(researchesState, 1)) { return [1, 2]; }
		if (isResearchComplete(researchesState, 5)) {
			if (!isResearchComplete(researchesState, 15)) { return [3, 4]; }
			return getAgeFactionIndustrial(researchesState, 4);
    }
		if (isResearchComplete(researchesState, 6)) {
			if (!isResearchComplete(researchesState, 9)) { return [3, 5]; }
			return getAgeFactionIndustrial(researchesState, 5);
    }
		return [2, 2];
  }
	
	if (isResearchComplete(researchesState, 4)) {
		if (!isResearchComplete(researchesState, 2)) { return [1, 3]; }
		if (isResearchComplete(researchesState, 7)) {
			if (!isResearchComplete(researchesState, 16)) { return [3, 6]; }
			return getAgeFactionIndustrial(researchesState, 6);
    }
		if (isResearchComplete(researchesState, 8)) {
			if (!isResearchComplete(researchesState, 17)) { return [3, 7]; }
			return getAgeFactionIndustrial(researchesState, 7);
    }
		return [2, 3];
  }

	return [0, 1];
}

function isResearchComplete(researchesState, research) {
  return researchesState.researchTimeLine.filter(entry => entry[0] <= researchesState.time && entry[1] === research).length > 0;
}
