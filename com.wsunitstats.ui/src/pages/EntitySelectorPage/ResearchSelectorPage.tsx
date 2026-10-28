import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useLoaderData, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { entityUrl, resolveImage } from '@/utils/utils';
import { useGameContext } from '@/store/gameDataStore';
import { useOptionsController } from '@/hooks/useOptionsController';
import { useValuesToQueryStringSync } from '@/hooks/useValuesToQueryStringSync';
import { ActionAreaCard } from '@/components/common/ActionAreaCard';
import { MultiSelect } from '@/components/common/MultiSelect';
import { FormButton } from '@/components/common/misc';
import type { ResearchSelectorContext, ResearchTypeOption } from '@/types/game';
import { EntitySelectorView } from './EntitySelectorView';
import { FilterButtonGroup, FilterPanel } from './FilterPanel';

export const ResearchSelectorPage = () => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const [searchParams] = useSearchParams();
  const { researches } = useGameContext();
  const filterOptions = useLoaderData() as ResearchSelectorContext | null;

  const researchTypes = searchParams.get(Constants.PARAM_RESEARCH_TYPES);
  const options = React.useMemo(() => {
    const typeIds = researchTypes?.split(',').map(Number);
    // researches have the type as its name (localization key)
    const typeNames = typeIds && filterOptions?.researchTypes
      .filter(type => typeIds.includes(type.id))
      .map(type => type.name);
    return typeNames ? researches.filter(research => typeNames.includes(research.type)) : researches;
  }, [researches, researchTypes, filterOptions]);

  return (
    <Box sx={{ width: '100%' }}>
      <EntitySelectorView
        title={t('entityPageTitleResearches')}
        options={options}
        getKey={(research) => research.gameId}
        filters={filterOptions && <ResearchFilters filterOptions={filterOptions} />}
        renderCard={(research) =>
          <ActionAreaCard
            size={210}
            name={t(research.name)}
            image={resolveImage(research.image)}
            imageSize={50}
            link={entityUrl(locale, Constants.RESEARCH_PAGE_PATH, research.gameId)}>
            <Typography variant="body2" color="text.secondary">
              {t(research.description)}
            </Typography>
          </ActionAreaCard>
        } />
    </Box>
  );
};

const ResearchFilters = ({ filterOptions }: { filterOptions: ResearchSelectorContext }) => {
  const { t } = useTranslation();
  const { sync, clear } = useValuesToQueryStringSync();
  const researchTypes = useOptionsController<ResearchTypeOption>(Constants.PARAM_RESEARCH_TYPES, filterOptions.researchTypes);

  return (
    <FilterPanel>
      <MultiSelect<ResearchTypeOption>
        sx={{ width: '350px' }}
        label={t('filtersResearchTypes')}
        values={researchTypes.values}
        options={researchTypes.options}
        onChange={researchTypes.setValues}
        getOptionLabel={(option) => t(option.name)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionKey={(option) => option.id} />
      <FilterButtonGroup>
        <FormButton
          onClick={() => sync(new Map([[Constants.PARAM_RESEARCH_TYPES, researchTypes.values]]))}
          disabled={researchTypes.isApplied}>
          {t('filtersApply')}
        </FormButton>
        <FormButton
          onClick={() => {
            clear([Constants.PARAM_RESEARCH_TYPES]);
            researchTypes.setValues([]);
          }}
          disabled={!researchTypes.hasQueryString}>
          {t('filtersClear')}
        </FormButton>
      </FilterButtonGroup>
    </FilterPanel>
  );
};
