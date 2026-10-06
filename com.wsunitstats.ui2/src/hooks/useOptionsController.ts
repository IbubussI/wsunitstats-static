import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import { defaultValueToQueryString } from '@/hooks/useValuesToQueryStringSync';

/**
 * Controller of selected options synced with a query string parameter.
 * Selected values are read from the query string, but are written there only by explicit sync
 * (see useValuesToQueryStringSync), so isApplied tells whether the selection is applied.
 *
 * @param paramName query string parameter to use
 * @param options all available options
 */
export function useOptionsController<T>(paramName: string, options: T[]) {
  const [searchParams] = useSearchParams();
  const [values, setValues] = React.useState<T[]>([]);
  // options are compared deeply, otherwise a new options array would reset not applied selection
  const optionsRef = React.useRef(options);
  if (!isEqual(optionsRef.current, options)) {
    optionsRef.current = options;
  }
  const stableOptions = optionsRef.current;

  const queryStringValues = React.useMemo(
    () => searchParams.get(paramName)?.split(',') ?? [],
    [searchParams, paramName]);

  // Sync query string params with options
  React.useEffect(() => {
    if (stableOptions.length > 0 && queryStringValues.length > 0) {
      const newValues = [...new Set(queryStringValues)]
        .map(value => stableOptions.find(option => defaultValueToQueryString(option) === value))
        .filter((value): value is T => value !== undefined);

      // set only if values are changed to not trigger re-render
      setValues((prevValues) => isEqual(newValues, prevValues) ? prevValues : newValues);
    }
  }, [stableOptions, queryStringValues]);

  return {
    values,
    options,
    setValues,
    isApplied: isEqual(queryStringValues, values.map(defaultValueToQueryString)),
    hasQueryString: queryStringValues.length > 0
  };
}
