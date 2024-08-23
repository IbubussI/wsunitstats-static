import * as React from 'react';
import * as Constants from 'utils/constants';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete, { autocompleteClasses, createFilterOptions } from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import SearchIcon from '@mui/icons-material/Search';
import { Image } from 'components/Atoms/Renderer';
import { InputAdornment, Popper, Stack, Typography, alpha, inputBaseClasses, outlinedInputClasses, styled, svgIconClasses } from '@mui/material';
import { useParams } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: '100%',
  maxWidth: '400px',
  margin: 10
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
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
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
  [`& .${autocompleteClasses.groupLabel}`]: {
    backgroundColor: theme.palette.secondary.light
  },
}));

export const EntityPicker = ({ onSelect, unitOptions, researchOptions }) => {
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');

  const addOptionMetadata = (array, entityRoute, optionGroupName) => {
    array.forEach((element) => {
      element.entityRoute = entityRoute;
      element.optionGroupName = optionGroupName;
    });
    return array
  };

  const unitOptionsSource = addOptionMetadata(unitOptions, Constants.UNIT_PAGE_PATH, "Units");
  const researchOptionsSource = addOptionMetadata(researchOptions, Constants.RESEARCH_PAGE_PATH, "Researches");
  const options = [...unitOptionsSource, ...researchOptionsSource]

  const selectValue = React.useCallback((newValue) => {
    if (newValue && typeof newValue.gameId === 'number') {
      onSelect(newValue.entityRoute, newValue.gameId);
    }
    setValue(newValue);
  }, [onSelect, setValue]);

  return (
    <Search>
      <StyledAutocomplete
        PopperComponent={StyledPopper}
        forcePopupIcon={false}
        clearOnBlur={false}
        autoComplete
        autoHighlight
        includeInputInList
        getOptionLabel={(option) => option.name ? option.name : ''}
        isOptionEqualToValue={(option, value) => value && option.gameId === value.gameId}
        groupBy={option => option.optionGroupName}
        options={options}
        value={value}
        filterOptions={createFilterOptions({
          limit: Constants.ENTITY_PICKER_OPTIONS_SIZE
        })}
        componentsProps={{
          paper: {
            elevation: 3
          }
        }}
        onChange={(_, newValue) => {
          selectValue(newValue);
        }}
        onInputChange={(_, newInputValue, reason) => {
          // Clear value if user changes the input
          if (value && reason === 'input') {
            setValue(null);
          }
          setInputValue(newInputValue);
        }}
        renderInput={({ ...params }) => {
          return (
            <TextField
              {...params}
              placeholder="Search..."
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
          );
        }}
        renderOption={(props, option) => {
          const matches = match(option.name, inputValue, { insideWords: true });
          const parts = parse(option.name, matches);
          const secondary = option.nation ? `${option.nation}, ID: ${option.gameId}` : `ID: ${option.gameId}`;
          return (
            <Box component='li' {...props} key={option.gameId}>
              <Grid container alignItems="center">
                <Grid item sx={{ width: 'calc(100% - 44px)' }}>
                  <Stack direction='row' alignItems='center'>
                    <Stack sx={{ marginRight: 0.6, height: 'fit-content' }}>
                      <Image data={{
                        path: option.image,
                        width: 42,
                        height: 42,
                      }} />
                    </Stack>
                    <Stack>
                      <Box>
                        {parts.map((part, index) => (
                          <Typography key={index}
                            component='span'
                            variant='body1'
                            color='text.primary'
                            sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
                          >
                            {part.text}
                          </Typography>
                        ))}
                      </Box>
                      {secondary && <Typography variant='body2' color='text.secondary'>
                        {secondary}
                      </Typography>}
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          );
        }}
      />
    </Search>
  );
}