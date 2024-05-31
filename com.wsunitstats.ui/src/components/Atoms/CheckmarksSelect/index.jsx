import * as React from 'react';
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Autocomplete, Checkbox, Chip, Stack, TextField, Typography, autocompleteClasses, styled } from "@mui/material";
import { Image } from "components/Atoms/Renderer";

const StyledAutocomplete = styled(Autocomplete)(() => ({
  [`& .${autocompleteClasses.inputRoot} .${autocompleteClasses.input}`]: {
    minWidth: 0,
    cursor: 'pointer',
    paddingRight: 0,
    paddingLeft: 0
  }
}));

export const CheckmarksSelect = (props) => {
  const {
    label,
    values,
    options,
    onChange,
    limitTags,
    getSecondaryText,
    ...forwardedProps
  } = props;

  return (
    <StyledAutocomplete
      {...forwardedProps}
      multiple
      disableCloseOnSelect
      onChange={(_, newValues) => onChange(newValues)}
      options={options}
      value={values}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            <Stack direction='row' alignItems='center'>
              {option.image &&
                <Stack sx={{ marginRight: 0.6, height: 'fit-content' }}>
                  <Image data={{
                    path: option.image,
                    width: 42,
                    height: 42,
                  }} />
                </Stack>}
              <Stack>
                <Typography variant='body1' color='text.primary'>
                  {option.name}
                </Typography>
                {getSecondaryText &&
                  <Typography variant='body2' color='text.secondary'>
                    {getSecondaryText(option)}
                  </Typography>}
              </Stack>
            </Stack>
          </li>
        );
      }}
      renderInput={({ inputProps, ...props }) => (
        <TextField {...props} inputProps={{ ...inputProps, readOnly: true }} label={label} sx={{ minWidth: '0' }} />
      )}
      componentsProps={{
        paper: {
          elevation: 3
        }
      }}
      renderTags={(value, getTagProps) => {
        const numTags = value.length;
        return (
          <>
            {value.slice(0, limitTags).map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={index}
                label={option.name}
              />
            ))}

            {numTags > limitTags && ` +${numTags - limitTags}`}
          </>
        );
      }}
    />
  );
}