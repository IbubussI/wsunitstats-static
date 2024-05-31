import * as Constants from "utils/constants";

export const resolveImage = (name) => {
  return `/files/images/${name}`;
}

export const makeEntityLink = (link) => {
  if (link.path === Constants.NO_LINK_INDICATOR) {
    return Constants.NO_LINK_INDICATOR;
  }
  if (link.id === undefined) {
    return `/${link.locale}/${link.path}`;
  }
  return `/${link.locale}/${link.path}/${link.id}/${Constants.INITIAL_TAB}`;
}

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
}

/**
 * Sets given path params to current url
 * 
 * @param {*} params array of objects { param: ..., pos: ...} where param is new param value to set, pos is index in the url where to set this param
 * @param {*} removeFrom if specified and positive - this function removes all param from (include) given in removeFrom position up to the end of the url
 * @returns current url with given path params
 */
export const getUrlWithPathParams = (params, removeFrom = 0) => {
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
  return pathItems.join('/') + search;
}

export const navigateToError = (navHook, msg, code) => {
  const path = window.location.pathname;
  const pathItems = path.split('/');
  pathItems.length = 3;
  pathItems[2] = Constants.ERROR_PAGE_PATH;
  navHook(pathItems.join('/'), { replace: true, state: { msg: msg, code: code } });
}

export const navigateTo404 = (navHook) => {
  navigateToError(navHook, 'Not found', 404);
}

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
}

export const getSearchParamList = (searchParams, paramName) => {
  const currentQuerySearchParams = searchParams.get(paramName)?.split(',');
  return currentQuerySearchParams ? [...currentQuerySearchParams] : [];
}

export const fetchJson = (fetchURI, callback) => {
  fetch(fetchURI)
    .then((response) => response.ok ? response.json() : [])
    .then(callback)
    .catch(console.log);
}