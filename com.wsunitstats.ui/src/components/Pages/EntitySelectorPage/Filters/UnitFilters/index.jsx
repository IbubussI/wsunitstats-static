import * as React from 'react';
import * as Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import { Box, styled } from "@mui/material";
import { MultiSelect } from 'components/Atoms/MultiSelect';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';
import { useOptionsController } from 'components/Hooks/useOptionsController';
import { FormButton } from 'components/Atoms/FormButton';
import { useTranslation } from 'react-i18next';

const FilterPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'stretch',
  padding: theme.spacing(2, 1, 3, 1)
}));

const FilterButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '300px',
  height: '56px',
  gap: theme.spacing(1),
}));

export const UnitFilters = ({ filterOptions }) => {
  const { t } = useTranslation();
  const { sync, clear } = useValuesToQueryStringSync();

  const nationOptionsController = useOptionsController(Constants.PARAM_NATIONS, filterOptions.nations);
  const unitTagOptionsController = useOptionsController(Constants.PARAM_UNIT_TAGS, filterOptions.unitTags);
  const searchTagOptionsController = useOptionsController(Constants.PARAM_SEARCH_TAGS, filterOptions.searchTags);

  const isAllApplied = nationOptionsController.isApplied
    && unitTagOptionsController.isApplied
    && searchTagOptionsController.isApplied;

  const hasQueryString = nationOptionsController.hasQueryString
    || unitTagOptionsController.hasQueryString
    || searchTagOptionsController.hasQueryString;

  // TODO: fix ripple effect breaks after button click
  return (
    <FilterPanel>
      <MultiSelect
        sx={{ width: '350px' }}
        label={t('filtersUnitTags')}
        values={unitTagOptionsController.values}
        options={unitTagOptionsController.options}
        onChange={unitTagOptionsController.setValues}
        limitTags={1}
        getOptionLabel={(option) => t(option.name)}
        isOptionEqualToValue={(option, value) => option.gameId === value.gameId} />
      <MultiSelect
        sx={{ width: '350px' }}
        label={t('filtersSearchTags')}
        values={searchTagOptionsController.values}
        options={searchTagOptionsController.options}
        onChange={searchTagOptionsController.setValues}
        limitTags={1}
        getOptionLabel={(option) => t(option.name)}
        isOptionEqualToValue={(option, value) => option.gameId === value.gameId} />
      <MultiSelect
        sx={{ width: '350px' }}
        label={t('filtersNations')}
        values={nationOptionsController.values}
        options={nationOptionsController.options}
        onChange={nationOptionsController.setValues}
        limitTags={1}
        getOptionLabel={(option) => Utils.localizeNation(t, option.name)}
        isOptionEqualToValue={(option, value) => option.gameId === value.gameId} />
      <FilterButtonGroup>
        <FormButton
          onClick={() => {
            const map = new Map();
            map.set(Constants.PARAM_NATIONS, nationOptionsController.values);
            map.set(Constants.PARAM_UNIT_TAGS, unitTagOptionsController.values);
            map.set(Constants.PARAM_SEARCH_TAGS, searchTagOptionsController.values);
            sync(map);
          }}
          disabled={isAllApplied}>
          {t('filtersApply')}
        </FormButton>
        <FormButton
          onClick={() => {
            clear([Constants.PARAM_NATIONS, Constants.PARAM_UNIT_TAGS, Constants.PARAM_SEARCH_TAGS]);
            nationOptionsController.setValues([]);
            unitTagOptionsController.setValues([]);
            searchTagOptionsController.setValues([]);
          }}
          disabled={!hasQueryString}>
          {t('filtersClear')}
        </FormButton>
      </FilterButtonGroup>
    </FilterPanel>
  );
}