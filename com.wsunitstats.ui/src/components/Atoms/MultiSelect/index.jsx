import * as React from 'react';
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Autocomplete, Checkbox, Chip, Stack, TextField, Typography, autocompleteClasses, createFilterOptions, styled } from "@mui/material";
import { Image } from "components/Atoms/Renderer";
import { useTranslation } from 'react-i18next';

const StyledAutocomplete = styled(Autocomplete)(() => ({
  [`& .${autocompleteClasses.inputRoot}, .${autocompleteClasses.input}`]: {
    cursor: 'pointer',
    minWidth: '0 !important'
  }
}));

export const MultiSelect = (props) => {
  const {
    label,
    values,
    options,
    onChange,
    limitTags,
    selectAll,
    getSecondaryText,
    size,
    primaryFontSize = 'body1',
    getOptionLabel = (option) => option.name,
    displayTags = true,
    slotProps,
    disableRipple = false,
    ...forwardedProps
  } = props;
  const { t } = useTranslation();
  const isAllSelected = values.length === options.length;
  const selectValues = (newValues) => {
    if (newValues.find(newValue => newValue.selectAll === true)) {
      if (isAllSelected) {
        onChange([]);
      } else {
        onChange(options);
      }
    } else {
      onChange(newValues);
    }
  };

  const filterOptions = createFilterOptions();
  return (
    <StyledAutocomplete
      {...forwardedProps}
      size={size}
      multiple
      disableCloseOnSelect
      onChange={(_, newValues) => selectValues(newValues)}
      options={options}
      value={values}
      getOptionLabel={getOptionLabel}
      filterOptions={(options, params) => {
        return selectAll ? [
          { name: t('multiSelectAllOption'), selectAll: true },
          ...filterOptions(options, params)
        ] : filterOptions(options, params);
      }}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props} key={props['data-option-index']} style={{ paddingLeft: '2px', paddingRight: '2px'}}>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={option.selectAll ? isAllSelected : selected}
              disableRipple={disableRipple}
            />
            <Stack direction='row' alignItems='center'>
              {option.image &&
                <Stack sx={{ marginRight: 0.6, height: 'fit-content' }}>
                  <Image path={option.image}
                    width={42}
                    height={42} />
                </Stack>}
              <Stack>
                <Typography variant={primaryFontSize} color='text.primary'>
                  {getOptionLabel(option)}
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
        <TextField {...props} inputProps={{ ...inputProps, readOnly: true }} label={displayTags ? label : ''} sx={{ minWidth: '0' }} />
      )}
      slotProps={{
        ...slotProps,
        paper: {
          elevation: 3
        }
      }}
      renderTags={(value, getTagProps) => {
        if (!displayTags) {
          return label;
        }
        const numTags = value.length;
        return (
          <>
            {value.slice(0, limitTags).map((option, index) => (
              <Chip
                size={size}
                {...getTagProps({ index })}
                key={index}
                label={getOptionLabel(option)}
              />
            ))}

            {numTags > limitTags && ` +${numTags - limitTags}`}
          </>
        );
      }}
    />
  );
};
