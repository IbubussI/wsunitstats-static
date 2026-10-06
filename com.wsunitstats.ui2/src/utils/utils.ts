import * as Constants from '@/utils/constants';
import type { TFunction } from 'i18next';
import type { NavigateFunction } from 'react-router-dom';
import type { EntityId, NationName } from '@/types/game';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

/** Game localization key, e.g. <*unitNameWarSelection/1/slinger> or <*upgrade12#0> */
export const LOCALIZATION_REGEX = /<\*[a-zA-Z0-9/_.-]+(#[0-9]+)?>/g;

export type EntityRoute = typeof Constants.UNIT_PAGE_PATH | typeof Constants.RESEARCH_PAGE_PATH;

export const resolveImage = (name: string) => `${Constants.IMAGES_PATH}/${name}`;

/**
 * Returns url of the entity page. Unit ids are paths, so the id takes several url segments
 * and the tab is always the last one
 */
export const entityUrl = (locale: string | undefined, route: EntityRoute, id: EntityId, tab: string = Constants.INITIAL_TAB) =>
  `/${locale ?? Constants.DEFAULT_LOCALE_OPTION}/${route}/${id}/${tab}`;

/**
 * Splits entity page path (everything after /unit/) to entity id and tab.
 * Tab is undefined when the path has no known tab at the end
 */
export const parseEntityPath = (path: string, tabs: string[]) => {
  const segments = path.split('/').filter(segment => segment.length > 0);
  const last = segments[segments.length - 1];
  if (segments.length > 1 && tabs.includes(last)) {
    return { id: segments.slice(0, -1).join('/'), tab: last };
  }
  return { id: segments.join('/'), tab: undefined };
};

/** Route of the entity created by an ability (null if the entity has no page) */
export const getAbilityRoute = (abilityType: number): EntityRoute | null => {
  switch (abilityType) {
    case Constants.ABILITY_TYPE_CREATE_UNIT:
    case Constants.ABILITY_TYPE_TRANSFORM:
      return Constants.UNIT_PAGE_PATH;
    case Constants.ABILITY_TYPE_RESEARCH:
      return Constants.RESEARCH_PAGE_PATH;
    default:
      return null;
  }
};

interface PathParam {
  /** new param value */
  param?: string | number | null;
  /** index of the param in the url path */
  pos: number;
}

/**
 * Sets given path params to current url
 *
 * @param params path params to set
 * @param keepSearch true to keep current search params in the returned URL
 * @param removeFrom if positive - all path items from this position up to the end are removed
 * @returns current url with given path params
 */
export const getUrlWithPathParams = (params: PathParam[], keepSearch = true, removeFrom = 0) => {
  const pathname = window.location.pathname;
  const search = window.location.search;
  let pathItems = pathname.split('/');
  for (const paramObj of params) {
    if (paramObj.param || paramObj.param === 0) {
      pathItems[paramObj.pos] = String(paramObj.param);
    } else if (paramObj.pos < pathItems.length) {
      pathItems = pathItems.splice(paramObj.pos, 1);
    }
  }
  if (removeFrom > 0) {
    pathItems.length = removeFrom;
  }
  return keepSearch ? pathItems.join('/') + search : pathItems.join('/');
};

export const navigateToError = (navigate: NavigateFunction, msg: string, code: number, keepLocale: boolean) => {
  const pathItems = window.location.pathname.split('/');
  pathItems.length = 3;
  if (!keepLocale) {
    pathItems[1] = Constants.DEFAULT_LOCALE_OPTION;
  }
  pathItems[2] = Constants.ERROR_PAGE_PATH;
  navigate(pathItems.join('/'), { replace: true, state: { msg: msg, code: code } });
};

export const fetchJson = <T = unknown>(fetchURI: string, successCallback: (json: T) => void, failCallback: (error: any) => void = console.log) => {
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
    .catch(failCallback);
};

export const formatDuration = (durationMillis: number) => {
  return dayjs.duration(durationMillis).format('HH:mm:ss').replace(/^(00:)|^(0)/, '');
};

export const formatDurationChartShort = (durationMillis: number) => {
  const x = dayjs.duration(durationMillis).format('HH[h]mm[m]');
  return x.replace(/^(00h0)|^(00h)|^(0)/, '');
};

export const formatDurationChartLong = (durationMillis: number) => {
  const x = dayjs.duration(durationMillis).format('HH[h] mm[m] ss[s]');
  return x.replace(/^(00h 00m 0)|^(00h 00m )|^(00h 0)|^(00h )|^(0)/, '');
};

export const formatTimeLong = (timeSec: number) => {
  return dayjs.unix(timeSec).format('DD/MM/YYYY HH:mm:ss');
};

export const localizeNation = (t: TFunction, nationName?: NationName) => {
  if (nationName) {
    const ir1 = nationName.ir1;
    const ir2 = nationName.ir2;
    return ir2 ? `${t(ir1)}/${t(ir2)}` : t(ir1);
  }
  return '';
};

/** Returns true if the value should be displayed */
export const isPresent = <T>(value: T | null | undefined): value is T => value != null && value !== '';

/** Appends a unit marker to the value, keeps empty values empty */
export const withUnits = (value: number | string | null | undefined, units: string) =>
  isPresent(value) ? `${value}${units}` : undefined;

/**
 * Solves multiway number partitioning problem.
 *
 * Splits elements array into k groups that have the most possible close sum of 'num' member of element.
 * Elements - array of values: { data, num } - data is arbitrary object, num is number
 */
export const solvePartitioning = <T extends { num: number }>(elements: T[], k: number) => {
  const result: { sum: number; values: T[] }[] = [];
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
};
