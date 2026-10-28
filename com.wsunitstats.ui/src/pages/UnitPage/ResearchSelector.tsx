import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { useOptionsController } from '@/hooks/useOptionsController';
import { useValuesToQueryStringSync } from '@/hooks/useValuesToQueryStringSync';
import { MultiSelect } from '@/components/common/MultiSelect';
import { FormButton } from '@/components/common/misc';
import type { UnitResearch } from '@/types/game';

/** Selection of researches to apply to the unit, kept in the query string */
export const ResearchSelector = ({ researches }: { researches: UnitResearch[] }) => {
  const { t } = useTranslation();
  const { sync } = useValuesToQueryStringSync();
  const optionsController = useOptionsController(Constants.PARAM_RESEARCH_IDS, researches);
  const researchValues = optionsController.values.filter(value => researches.some(option => value.gameId === option.gameId));

  return (
    <Stack direction='row' sx={{ gap: 0.5, width: '100%', margin: '2px', maxWidth: 'sm', paddingTop: '5px' }}>
      <MultiSelect<UnitResearch>
        sx={{ width: '100%' }}
        label={t('researchSelectorLabel')}
        values={researchValues}
        options={researches}
        onChange={optionsController.setValues}
        limitTags={3}
        getSecondaryText={(option) => 'ID: ' + option.gameId}
        getOptionLabel={(option) => t(option.name)}
        getOptionImage={(option) => option.image}
        isOptionEqualToValue={(option, value) => option.gameId === value.gameId}
        getOptionKey={(option) => option.gameId}
      />
      <FormButton
        onClick={() => sync(new Map([[Constants.PARAM_RESEARCH_IDS, researchValues]]))}
        disabled={optionsController.isApplied}>
        {t('researchSelectorApply')}
      </FormButton>
    </Stack>
  );
};
