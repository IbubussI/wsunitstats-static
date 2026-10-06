import * as React from 'react';
import { Autocomplete, autocompleteClasses, TextField, type AutocompleteProps } from '@mui/material';

export type SingleSelectProps<T> = Omit<
  AutocompleteProps<T, false, true, false>,
  'options' | 'value' | 'onChange' | 'renderInput' | 'getOptionLabel'
> & {
  label?: string;
  value: T | null;
  options: T[];
  onChange: (value: T) => void;
  getOptionLabel?: (option: T) => string;
};

export const SingleSelect = <T,>(props: SingleSelectProps<T>) => {
  const {
    onChange,
    value,
    options,
    label,
    getOptionLabel = (option: T) => String((option as { name?: string }).name),
    sx,
    ...forwardedProps
  } = props;

  return (
    <Autocomplete<T, false, true, false>
      {...forwardedProps}
      sx={[
        { [`& .${autocompleteClasses.inputRoot}, .${autocompleteClasses.input}`]: { cursor: 'pointer' } },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      getOptionLabel={getOptionLabel}
      options={options}
      // null is a valid "no value" for a controlled autocomplete
      value={value as NonNullable<T>}
      disableClearable
      selectOnFocus={false}
      onChange={(_, newValue) => onChange(newValue)}
      slotProps={{
        paper: {
          elevation: 3
        }
      }}
      renderInput={({ inputProps, ...params }) => (
        <TextField {...params} inputProps={{ ...inputProps, readOnly: true }} label={label} />
      )}
      renderOption={(optionProps, option) => {
        const { key, ...liProps } = optionProps as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
        return (
          <li {...liProps} key={key}>
            {getOptionLabel(option)}
          </li>
        );
      }}
    />
  );
};
