import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useLoaderData, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { entityUrl, localizeNation, resolveImage } from '@/utils/utils';
import { useGameContext } from '@/store/gameDataStore';
import { useOptionsController } from '@/hooks/useOptionsController';
import { useValuesToQueryStringSync } from '@/hooks/useValuesToQueryStringSync';
import { ActionAreaCard } from '@/components/common/ActionAreaCard';
import { MultiSelect } from '@/components/common/MultiSelect';
import { FormButton } from '@/components/common/misc';
import type { FilterOption, NationFilterOption, UnitSelectorContext } from '@/types/game';
import { EntitySelectorView } from './EntitySelectorView';
import { FilterButtonGroup, FilterPanel } from './FilterPanel';

const parseIds = (value: string | null) =>
  value?.split(',').map(Number).filter(id => !isNaN(id));

export const UnitSelectorPage = () => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const [searchParams] = useSearchParams();
  const { units } = useGameContext();
  const filterOptions = useLoaderData() as UnitSelectorContext | null;

  const nations = searchParams.get(Constants.PARAM_NATIONS);
  const searchTags = searchParams.get(Constants.PARAM_SEARCH_TAGS);
  const unitTags = searchParams.get(Constants.PARAM_UNIT_TAGS);
  const options = React.useMemo(() => {
    const nationIds = parseIds(nations);
    const searchTagIds = parseIds(searchTags);
    const unitTagIds = parseIds(unitTags);
    return units.filter(unit =>
      (!nationIds || nationIds.includes(unit.nationId)) &&
      (!searchTagIds || searchTagIds.some(tag => unit.searchTags.includes(tag))) &&
      (!unitTagIds || unitTagIds.some(tag => unit.unitTags.includes(tag))));
  }, [units, nations, searchTags, unitTags]);

  return (
    <Box sx={{ width: '100%' }}>
      <EntitySelectorView
        title={t('entityPageTitleUnits')}
        options={options}
        getKey={(unit) => unit.gameId}
        filters={filterOptions && <UnitFilters filterOptions={filterOptions} />}
        renderCard={(unit) =>
          <ActionAreaCard
            size={210}
            name={t(unit.name)}
            image={resolveImage(unit.image)}
            imageSize={100}
            link={entityUrl(locale, Constants.UNIT_PAGE_PATH, unit.gameId)}>
            <Typography variant="body2" color="text.secondary">
              {localizeNation(t, unit.nation)}
            </Typography>
          </ActionAreaCard>
        } />
    </Box>
  );
};

const isSameOption = (option: { gameId: number }, value: { gameId: number }) => option.gameId === value.gameId;

const UnitFilters = ({ filterOptions }: { filterOptions: UnitSelectorContext }) => {
  const { t } = useTranslation();
  const { sync, clear } = useValuesToQueryStringSync();

  const nations = useOptionsController<NationFilterOption>(Constants.PARAM_NATIONS, filterOptions.nations);
  const unitTags = useOptionsController<FilterOption>(Constants.PARAM_UNIT_TAGS, filterOptions.unitTags);
  const searchTags = useOptionsController<FilterOption>(Constants.PARAM_SEARCH_TAGS, filterOptions.searchTags);

  const isAllApplied = nations.isApplied && unitTags.isApplied && searchTags.isApplied;
  const hasQueryString = nations.hasQueryString || unitTags.hasQueryString || searchTags.hasQueryString;

  return (
    <FilterPanel>
      <MultiSelect<FilterOption>
        sx={{ width: '350px' }}
        label={t('filtersUnitTags')}
        values={unitTags.values}
        options={unitTags.options}
        onChange={unitTags.setValues}
        getOptionLabel={(option) => t(option.name)}
        isOptionEqualToValue={isSameOption}
        getOptionKey={(option) => option.gameId} />
      <MultiSelect<FilterOption>
        sx={{ width: '350px' }}
        label={t('filtersSearchTags')}
        values={searchTags.values}
        options={searchTags.options}
        onChange={searchTags.setValues}
        getOptionLabel={(option) => t(option.name)}
        isOptionEqualToValue={isSameOption}
        getOptionKey={(option) => option.gameId} />
      <MultiSelect<NationFilterOption>
        sx={{ width: '350px' }}
        label={t('filtersNations')}
        values={nations.values}
        options={nations.options}
        onChange={nations.setValues}
        getOptionLabel={(option) => localizeNation(t, option.name)}
        isOptionEqualToValue={isSameOption}
        getOptionKey={(option) => option.gameId} />
      <FilterButtonGroup>
        <FormButton
          onClick={() => sync(new Map<string, unknown[]>([
            [Constants.PARAM_NATIONS, nations.values],
            [Constants.PARAM_UNIT_TAGS, unitTags.values],
            [Constants.PARAM_SEARCH_TAGS, searchTags.values]
          ]))}
          disabled={isAllApplied}>
          {t('filtersApply')}
        </FormButton>
        <FormButton
          onClick={() => {
            clear([Constants.PARAM_NATIONS, Constants.PARAM_UNIT_TAGS, Constants.PARAM_SEARCH_TAGS]);
            nations.setValues([]);
            unitTags.setValues([]);
            searchTags.setValues([]);
          }}
          disabled={!hasQueryString}>
          {t('filtersClear')}
        </FormButton>
      </FilterButtonGroup>
    </FilterPanel>
  );
};
