import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { entityUrl, resolveImage } from '@/utils/utils';
import { useGameContext } from '@/store/gameDataStore';
import { ActionAreaCard } from '@/components/common/ActionAreaCard';
import { EntitySelectorView } from './EntitySelectorView';

export const ResearchSelectorPage = () => {
  const { t } = useTranslation();
  const { locale } = useParams();
  const { researches } = useGameContext();

  return (
    <Box sx={{ width: '100%' }}>
      <EntitySelectorView
        title={t('entityPageTitleResearches')}
        options={researches}
        getKey={(research) => research.gameId}
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
