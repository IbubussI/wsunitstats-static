import * as React from 'react';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Autocomplete,
  autocompleteClasses,
  Checkbox,
  Chip,
  createFilterOptions,
  Stack,
  TextField,
  Typography,
  type AutocompleteProps,
  type TypographyProps
} from '@mui/material';
import { Image } from '@/components/common/Image';
import { useTranslation } from 'react-i18next';

interface SelectAllOption {
  selectAll: true;
  name: string;
}

type Option<T> = T | SelectAllOption;

const isSelectAll = (option: unknown): option is SelectAllOption =>
  typeof option === 'object' && option !== null && (option as SelectAllOption).selectAll === true;

export type MultiSelectProps<T> = Omit<
  AutocompleteProps<Option<T>, true, boolean, false>,
  'options' | 'value' | 'onChange' | 'renderInput' | 'getOptionLabel' | 'isOptionEqualToValue'
> & {
  label?: string;
  values: T[];
  options: T[];
  onChange: (values: T[]) => void;
  limitTags?: number;
  /** adds "Select All" option */
  selectAll?: boolean;
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  getSecondaryText?: (option: T) => string;
  getOptionImage?: (option: T) => string | undefined;
  primaryFontSize?: TypographyProps['variant'];
  /** show chips of selected values (otherwise only the label is shown) */
  displayTags?: boolean;
  disableRipple?: boolean;
};

export const MultiSelect = <T,>(props: MultiSelectProps<T>) => {
  const {
    label,
    values,
    options,
    onChange,
    limitTags = 1,
    selectAll,
    getSecondaryText,
    getOptionImage,
    size,
    primaryFontSize = 'body1',
    getOptionLabel = (option: T) => String((option as { name?: string }).name),
    isOptionEqualToValue = (option: T, value: T) => option === value,
    displayTags = true,
    slotProps,
    disableRipple = false,
    sx,
    ...forwardedProps
  } = props;
  const { t } = useTranslation();
  const isAllSelected = values.length === options.length;
  const filterOptions = React.useMemo(() => createFilterOptions<Option<T>>(), []);
  const optionLabel = (option: Option<T>) => isSelectAll(option) ? option.name : getOptionLabel(option);

  const selectValues = (newValues: Option<T>[]) => {
    if (newValues.some(isSelectAll)) {
      onChange(isAllSelected ? [] : options);
    } else {
      onChange(newValues as T[]);
    }
  };

  return (
    <Autocomplete<Option<T>, true, boolean, false>
      {...forwardedProps}
      sx={[
        {
          [`& .${autocompleteClasses.inputRoot}, .${autocompleteClasses.input}`]: {
            cursor: 'pointer',
            minWidth: '0 !important'
          }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      size={size}
      multiple
      disableCloseOnSelect
      onChange={(_, newValues) => selectValues(newValues)}
      options={options}
      value={values}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(option, value) => !isSelectAll(option) && !isSelectAll(value) && isOptionEqualToValue(option, value)}
      filterOptions={(options, params) => {
        const filtered = filterOptions(options, params);
        return selectAll ? [{ name: t('multiSelectAllOption'), selectAll: true }, ...filtered] : filtered;
      }}
      renderOption={(optionProps, option, { selected }) => {
        const { key, ...liProps } = optionProps as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
        const image = !isSelectAll(option) && getOptionImage ? getOptionImage(option) : undefined;
        return (
          <li {...liProps} key={key} style={{ paddingLeft: '2px', paddingRight: '2px' }}>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={isSelectAll(option) ? isAllSelected : selected}
              disableRipple={disableRipple}
            />
            <Stack direction='row' alignItems='center'>
              {image &&
                <Stack sx={{ marginRight: 0.6, height: 'fit-content' }}>
                  <Image path={image} width={42} height={42} />
                </Stack>}
              <Stack>
                <Typography variant={primaryFontSize} color='text.primary'>
                  {optionLabel(option)}
                </Typography>
                {getSecondaryText && !isSelectAll(option) &&
                  <Typography variant='body2' color='text.secondary'>
                    {getSecondaryText(option)}
                  </Typography>}
              </Stack>
            </Stack>
          </li>
        );
      }}
      renderInput={({ inputProps, ...params }) => (
        <TextField {...params} inputProps={{ ...inputProps, readOnly: true }} label={displayTags ? label : ''} sx={{ minWidth: '0' }} />
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
        return (
          <>
            {value.slice(0, limitTags).map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return <Chip size={size} {...tagProps} key={key} label={optionLabel(option)} />;
            })}
            {value.length > limitTags && ` +${value.length - limitTags}`}
          </>
        );
      }}
    />
  );
};
