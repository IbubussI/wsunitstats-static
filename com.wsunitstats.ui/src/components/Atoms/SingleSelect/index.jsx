import * as React from 'react';
import { Autocomplete, autocompleteClasses, styled, TextField } from '@mui/material';

const StyledAutocomplete = styled(Autocomplete)({
  [`& .${autocompleteClasses.inputRoot}, .${autocompleteClasses.input}`]: {
    cursor: 'pointer'
  },
});

export const SingleSelect = (props) => {
  const {
    onChange,
    value,
    options,
    label,
    getOptionLabel = option => option.name,
    ...forwardedProps
  } = props;

  return (
    <StyledAutocomplete
      {...forwardedProps}
      getOptionLabel={getOptionLabel}
      options={options}
      value={value}
      disableClearable
      selectOnFocus={false}
      onChange={(_, newValue) => {
        onChange(newValue);
      }}
      slotProps={{
        paper: {
          elevation: 3
        }
      }}
      renderInput={({ inputProps, ...props }) => (
        <TextField {...props} inputProps={{ ...inputProps, readOnly: true }} label={label} />
      )}
    />
  );
}
