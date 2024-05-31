import * as React from 'react';
import { isEqual } from 'lodash';
import { useSearchParams } from 'react-router-dom';

/**
 * Returns a function that will set given values to query string parameters.
 * Does nothing if the query string already equal to given values
 */
export function useValuesToQueryStringSync(valueToQueryString =
  (value) => value.id?.toString() || value.gameId?.toString() || value.name?.toString()) {
  const [searchParams, setSearchParams] = useSearchParams();

  const syncValues = React.useCallback((map) => {
    let isUpdatePending = false;

    for (const entry of map) {
      const paramName = entry[0];
      const values = entry[1];

      let prevValues = searchParams.get(paramName);
      if (prevValues) {
        prevValues = prevValues.split(',');
      } else {
        prevValues = [];
      }

      const isUpdated = isEqual(prevValues, values);
      if (!isUpdated) {
        if (values.length) {
          searchParams.set(paramName, values.map(value => valueToQueryString(value)).join(','));
        } else {
          searchParams.delete(paramName);
        }
        isUpdatePending = true;
      }
    }

    // avoid navigation when nothing changes
    if (isUpdatePending) {
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, valueToQueryString]);

  const clearValues = React.useCallback((paramNames) => {
    let isUpdatePending = false;

    for (const paramName of paramNames) {
      if (searchParams.get(paramName)) {
        searchParams.delete(paramName);
        isUpdatePending = true;
      }
    }

    if (isUpdatePending) {
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams])

  return {
    sync: syncValues,
    clear: clearValues
  };
}