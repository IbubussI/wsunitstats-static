import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';

export const DynamicSelect = (props) => {
  const {
    onSelect,
    getOptionLabel,
    value,
    options,
    ...forwardedProps
  } = props;

  return (
    <Autocomplete
      {...forwardedProps}
      options={options}
      getOptionLabel={getOptionLabel}
      sx={{ width: 100 }}
      value={value}
      disableClearable
      onChange={(_, newValue) => {
        onSelect(newValue);
      }}
      componentsProps={{
        paper: {
          elevation: 3
        }
      }}
      renderInput={({ inputProps, ...props }) => (
        <TextField {...props} inputProps={{ ...inputProps, readOnly: true }} label="Locale" />
      )}
    />
  );
}