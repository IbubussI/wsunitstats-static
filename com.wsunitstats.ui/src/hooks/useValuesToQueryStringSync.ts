import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { useSearchParams } from 'react-router-dom';

/** Default conversion of an option to its query string value */
export const defaultValueToQueryString = (value: unknown): string => {
  if (typeof value === 'object' && value !== null) {
    const option = value as { id?: unknown; gameId?: unknown; name?: unknown };
    return String(option.id ?? option.gameId ?? option.name);
  }
  return String(value);
};

/**
 * Returns functions to set given values to query string parameters and to clear them.
 * Does nothing if the query string already equal to given values
 */
export function useValuesToQueryStringSync(valueToQueryString: (value: unknown) => string = defaultValueToQueryString) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sync = React.useCallback((map: Map<string, unknown[]>) => {
    let isUpdatePending = false;

    for (const [paramName, values] of map) {
      const prevValues = searchParams.get(paramName)?.split(',') ?? [];
      const newValues = values.map(valueToQueryString);
      if (!isEqual(prevValues, newValues)) {
        if (newValues.length) {
          searchParams.set(paramName, newValues.join(','));
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

  const clear = React.useCallback((paramNames: string[]) => {
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
  }, [searchParams, setSearchParams]);

  return { sync, clear };
}
