import * as Constants from "utils/constants";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const LOCALIZATION_REGEX = new RegExp("<\\*[a-zA-Z0-9/]+>", "g");

export const resolveImage = (name) => {
  return `/files/images/${name}`;
};

export const makeEntityLink = (locale, link) => {
  if (link.path === Constants.NO_LINK_INDICATOR) {
    return Constants.NO_LINK_INDICATOR;
  }
  if (link.id === undefined) {
    return `/${locale}/${link.path}`;
  }
  return `/${locale}/${link.path}/${link.id}/${Constants.INITIAL_TAB}`;
};

/**
 * Returns route to page for given entity type if supported or default page otherwise
 * 
 * @param {*} entityType current mappings
 * 
 * unit => Constants.UNIT_PAGE_PATH
 * 
 * research => Constants.RESEARCH_PAGE_PATH (not implemented yet)
 * 
 * [anything] => Constants.NO_LINK_INDICATOR
 * 
 * @returns route to entity page
 */
export const getEntityRoute = (entityType) => {
  let result;
  switch (entityType) {
    case 'unit':
      result = Constants.UNIT_PAGE_PATH;
      break;
    case 'research':
      result = Constants.RESEARCH_PAGE_PATH;
      break;
    //case 'env': Constants.ENV_PAGE_PATH; break; <-- TODO
    //case 'resource': Constants.RESOURCE_PAGE_PATH; break; <-- TODO
    default: result = Constants.NO_LINK_INDICATOR;
  }
  return result;
};

/**
 * Sets given path params to current url
 * 
 * @param {*} params array of objects { param: ..., pos: ...} where param is new param value to set, pos is index in the url where to set this param
 * @param {*} keepSearch true to keep current search params in the returned URL (default - true)
 * @param {*} removeFrom if specified and positive - this function removes all param from (include) given in removeFrom position up to the end of the url
 * @returns current url with given path params
 */
export const getUrlWithPathParams = (params, keepSearch = true, removeFrom = 0) => {
  const pathname = window.location.pathname;
  const search = window.location.search;
  let pathItems = pathname.split('/');
  for (const paramObj of params) {
    if (paramObj.param || paramObj.param === 0) {
      pathItems[paramObj.pos] = paramObj.param;
    } else if (paramObj.pos < pathItems.length) {
      pathItems = pathItems.splice(paramObj.pos, 1);
    }
  }
  if (removeFrom > 0) {
    pathItems.length = removeFrom;
  }
  return keepSearch ? pathItems.join('/') + search : pathItems.join('/');
};

export const navigateToError = (navHook, msg, code, keepLocale) => {
  const path = window.location.pathname;
  const pathItems = path.split('/');
  pathItems.length = 3;
  if (!keepLocale) {
    pathItems[1] = Constants.DEFAULT_LOCALE_OPTION;
  }
  pathItems[2] = Constants.ERROR_PAGE_PATH;
  navHook(pathItems.join('/'), { replace: true, state: { msg: msg, code: code } });
};

export const navigateTo404 = (navHook, keepLocale) => {
  navigateToError(navHook, 'Not found', 404, keepLocale);
};

/**
 * Shorhand for Utils.getEntityRoute()
 * @param {*} abilityType
 * 0 => training
 * 
 * 1 => research
 * 
 * 2 => transformation
 * 
 * 3 => create env
 * @returns redirection target for given ability type
 */
export const getAbilityRoute = (abilityType) => {
  let result;
  switch (abilityType) {
    case 0: case 2: result = getEntityRoute('unit'); break;
    case 1: case 4: result = getEntityRoute('research'); break;
    default: result = getEntityRoute('');
  }
  return result;
};

export const getSearchParamList = (searchParams, paramName) => {
  const currentQuerySearchParams = searchParams.get(paramName)?.split(',');
  return currentQuerySearchParams ? [...currentQuerySearchParams] : [];
};

export const fetchJson = (fetchURI, successCallback, failCallback) => {
  fetch(fetchURI)
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((json) => Promise.reject('Received response is not sucesseful: ' + json));
        }
      } else {
        return response.text().then((text) => Promise.reject('Received response is not JSON type: ' + text));
      }
    })
    .then(successCallback)
    .catch(failCallback ? failCallback : console.log);
};

/**
 * Replaces found localization tokens with values provided in localeData
 * 
 * @deprecated replaced with localization framework and locale files
 * @param {*} target anything to be localized
 * @param {*} localeData object that reprtesents a list of localization key-value pairs
 * @returns 
 */
export const localize = (target, localeData) => {
  let result;
  if (Array.isArray(target)) {
    result = new Array(target.length);
    for (let i = 0; i < target.length; ++i) {
      const x = localize(target[i], localeData);
      result[i] = x;
    }
  } else if (typeof target === 'string' || target instanceof String) {
    const keys = [...target.matchAll(LOCALIZATION_REGEX)];
    result = target;
    if (keys) {
      for (const key of keys) {
        const replacement = localeData[key];
        if (replacement) {
          result = result.replace(key, replacement);
        } else {
          result = result.replace(key, "");
        }
      }
    }
  } else if (typeof target === 'object' && target !== null) {
    result = {};
    for (const prop in target) {
      const x = localize(target[prop], localeData);
      result[prop] = x;
    }
  } else {
    result = target;
  }
  return result;
};

export const formatDuration = (durationMillis) => {
  return dayjs.duration(durationMillis).format('HH:mm:ss').replace(/^(00:00:)|^(00:)|^(0)/, "");
};

export const formatDurationChartShort = (durationMillis) => {
  const x = dayjs.duration(durationMillis).format('HH[h]mm[m]')
  return x.replace(/^(00h0)|^(00h)|^(0)/, "");
};

export const formatDurationChartLong = (durationMillis) => {
  const x = dayjs.duration(durationMillis).format('HH[h] mm[m] ss[s]')
  return x.replace(/^(00h 00m 0)|^(00h 00m )|^(00h 0)|^(00h )|^(0)/, "");
};


export const formatTimeLong = (timeSec) => {
  return dayjs.unix(timeSec).format('DD/MM/YYYY HH:mm:ss');
};

export const localizeNation = (t, nationName) => {
  if (nationName) {
    const ir1 = nationName.ir1;
    const ir2 = nationName.ir2;
    return ir2 ? `${t(ir1)}/${t(ir2)}` : t(ir1);
  }
  return "";
};

/**
 * Solves multiway number partitioning problem.
 * 
 * Splits elements array into k groups that have the most possible close sum of 'num' member of element.
 * Elements - array of values: { data, num } - data is arbitrary object, num is number
 */ 
export const solvePartitioning = (elements, k) => {
  const result = [];
  for (let i = 0; i < k; i++) {
    result.push({
      sum: 0,
      values: [],
    });
  }

  // copy to not mutate input array and sort desc
  const elementsSorted = [...elements].sort((e1, e2) => e2.num - e1.num);
  for (const elem of elementsSorted) {
    // sort asc to find smallest group
    const smallestGroup = result.sort((g1, g2) => g1.sum - g2.sum)[0];
    // add next biggest value to the smalles group
    smallestGroup.values.push(elem);
    smallestGroup.sum += elem.num;
  }

  return result.map(g => g.values);
}
