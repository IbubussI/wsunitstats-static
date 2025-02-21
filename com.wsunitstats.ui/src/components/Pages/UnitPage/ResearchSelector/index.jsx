import * as React from 'react';
import * as Constants from 'utils/constants';
import { Stack } from '@mui/material';
import { CheckmarksSelect } from 'components/Atoms/CheckmarksSelect';
import { useOptionsController } from 'components/Hooks/useOptionsController';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';
import { FormButton } from 'components/Atoms/FormButton';
import { useTranslation } from 'react-i18next';

export const ResearchSelector = ({ researches }) => {
  const { t } = useTranslation();
  const { sync } = useValuesToQueryStringSync();
  const optionsController = useOptionsController(Constants.PARAM_RESEARCH_IDS, researches);
  const researchValues = optionsController.values.filter(value => researches.some(option => value.gameId === option.gameId));

  return researches.length ? (
    <Stack direction='row' sx={{ gap: 0.5, width: '100%', margin: '2px', maxWidth: 'sm', paddingTop: '5px' }}>
      <CheckmarksSelect
        sx={{ width: '100%' }}
        label={t('researchSelectorLabel')}
        values={researchValues}
        options={researches}
        onChange={optionsController.setValues}
        limitTags={3}
        getSecondaryText={(option) => 'ID: ' + option.gameId}
        isOptionEqualToValue={(option, value) => option.gameId === value.gameId}
        localizeFunc={t}
      />
      <FormButton
        onClick={() => {
          const map = new Map();
          map.set(Constants.PARAM_RESEARCH_IDS, researchValues);
          sync(map);
        }}
        disabled={optionsController.isApplied}>
        {t('researchSelectorApply')}
      </FormButton>
    </Stack>
  ) : (false);
}
