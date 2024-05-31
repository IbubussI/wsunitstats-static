import * as React from 'react';
import * as Utils from 'utils/utils';
import { useSearchParams } from 'react-router-dom';
import isEqual from 'lodash/isEqual';

/**
 * Options controller intended to be used to handle dynamic options. Does not sync options with query string
 * 
 * @param paramName query string parameter to use;
 * @param fetchURL URL string to fetch options list;
 * @param valueToQueryString function to get the query string param from the value.
 * If it is not specified default one will use 'id', 'gameId' or 'name', checking them in the specified order.
 * Must return unique string for every option
 * 
 * @returns 
 * values - currently selected options
 * 
 * options - all available options
 * 
 * setValues - function to set values
 * 
 * isApplied - true if only all the selected options are applied, false - otherwise
 */
export function useOptionsController(paramName, fetchURL,
  valueToQueryString = (value) => value.id?.toString() || value.gameId?.toString() || value.name?.toString()) {

  const [searchParams] = useSearchParams();
  const [values, setValues] = React.useState([]);
  const [options, setOptions] = React.useState([]);

  const queryStringValues = React.useMemo(() => {
    const currentQuerySearchParams = searchParams.get(paramName)?.split(',');
    return currentQuerySearchParams ? [...currentQuerySearchParams] : [];
  }, [searchParams, paramName]);

  // receive options list
  React.useEffect(() => {
    // clear initial selected array to ensure there will be no invalid values until fetch is completed
    setValues([]);

    Utils.fetchJson(fetchURL, (result) => setOptions(result));
  }, [fetchURL]);

  // Sync query string params with options
  React.useEffect(() => {
    if (options.length > 0 && queryStringValues.length > 0) {
      const newValues = queryStringValues
        .filter((value, index, array) => array.indexOf(value) === index) // set only unique
        .map((value) => {
          // set only available in options
          for (const option of options) {
            if (valueToQueryString(option) === value) {
              return option;
            }
          }
          return null;
        })
        .filter(value => value);

      // set only if values are changed to not trigger re-render
      setValues((prevValues) => isEqual(newValues, prevValues) ? prevValues : newValues);
    }
  // valueToQueryString should be always the same
  // Adding it to dependecy array will result to unnecessary sync after selecting but not applying a value
  // eslint-disable-next-line
  }, [options, queryStringValues]);

  return {
    values: values,
    options: options,
    setValues: setValues,
    isApplied: isEqual(queryStringValues, values.map(valueToQueryString)),
    hasQueryString: queryStringValues.length > 0
  };
}