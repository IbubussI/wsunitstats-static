import * as React from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import SearchIcon from '@mui/icons-material/Search';
import {
  alpha,
  Autocomplete,
  autocompleteClasses,
  Box,
  createFilterOptions,
  InputAdornment,
  inputBaseClasses,
  outlinedInputClasses,
  Popper,
  Stack,
  styled,
  svgIconClasses,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { entityUrl, localizeNation, type EntityRoute } from '@/utils/utils';
import { useGameContext } from '@/store/gameDataStore';
import { Image } from '@/components/common/Image';
import type { EntityId, NationName } from '@/types/game';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: '100%',
  maxWidth: '300px',
  margin: 10
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
  [`& .${autocompleteClasses.groupLabel}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]
  },
}));

interface PickerOption {
  gameId: EntityId;
  name: string;
  image: string;
  nation?: NationName;
  route: EntityRoute;
  group: string;
}

const filterOptions = createFilterOptions<PickerOption>({
  limit: Constants.ENTITY_PICKER_OPTIONS_SIZE
});

/** Search of units and researches in the header */
export const EntityPicker = () => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = React.useState<PickerOption | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const { units, researches } = useGameContext();

  const options = React.useMemo<PickerOption[]>(() => [
    ...units.map(unit => ({ ...unit, route: Constants.UNIT_PAGE_PATH as EntityRoute, group: t('entityPickerUnits') })),
    ...researches.map(research => ({ ...research, route: Constants.RESEARCH_PAGE_PATH as EntityRoute, group: t('entityPickerResearches') }))
  ], [units, researches, t]);

  return (
    <Search>
      <Autocomplete<PickerOption>
        sx={(theme) => ({
          [`& .${outlinedInputClasses.notchedOutline}`]: {
            border: 0
          },
          [`& .${outlinedInputClasses.root}`]: {
            padding: '0 0 0 7px'
          },
          [`& .${inputBaseClasses.input}`]: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            color: 'white'
          },
          [`& .${svgIconClasses.root}`]: {
            color: 'white'
          },
        })}
        slots={{ popper: StyledPopper }}
        slotProps={{ paper: { elevation: 3 } }}
        forcePopupIcon={false}
        clearOnBlur={false}
        autoComplete
        autoHighlight
        includeInputInList
        getOptionLabel={(option) => option.name ? t(option.name) : ''}
        isOptionEqualToValue={(option, value) => option.route === value.route && option.gameId === value.gameId}
        // names are not unique, non-unique keys leave stale options in the list
        getOptionKey={(option) => `${option.route}/${option.gameId}`}
        groupBy={option => option.group}
        options={options}
        value={value}
        filterOptions={filterOptions}
        onChange={(_, newValue) => {
          if (newValue) {
            // search params are not kept as we are navigating to another entity
            navigate(entityUrl(locale, newValue.route, newValue.gameId));
          }
          setValue(newValue);
        }}
        onInputChange={(_, newInputValue, reason) => {
          // Clear value if user changes the input
          if (value && reason === 'input') {
            setValue(null);
          }
          setInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t('entityPickerSearch')}
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...liProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
          const name = t(option.name);
          const parts = parse(name, match(name, inputValue, { insideWords: true }));
          const secondary = localizeNation(t, option.nation);
          return (
            <Box component='li' {...liProps} key={key}>
              <Stack direction='row' alignItems='center' sx={{ minWidth: 0 }}>
                <Stack sx={{ marginRight: 0.6, height: 'fit-content' }}>
                  <Image path={option.image} width={42} height={42} />
                </Stack>
                <Stack sx={{ minWidth: 0 }}>
                  <Box>
                    {parts.map((part, index) => (
                      <Typography key={index}
                        component='span'
                        variant='body1'
                        color='text.primary'
                        sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}>
                        {part.text}
                      </Typography>
                    ))}
                  </Box>
                  {secondary && <Typography variant='body2' color='text.secondary'>
                    {secondary}
                  </Typography>}
                </Stack>
              </Stack>
            </Box>
          );
        }}
      />
    </Search>
  );
};
