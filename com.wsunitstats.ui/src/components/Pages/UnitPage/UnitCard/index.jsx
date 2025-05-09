import * as Utils from 'utils/utils';
import { Typography } from "@mui/material"
import { ActionAreaCard } from 'components/Atoms/Card/Card';
import { useTranslation } from 'react-i18next';

const CARD_WIDTH = 210
const CARD_IMAGE_SIZE = 100

export const UnitCard = ({ option, link }) => {
  const { t } = useTranslation();
  return (
    <ActionAreaCard
      id={option.gameId}
      size={CARD_WIDTH}
      name={t(option.name)}
      image={Utils.resolveImage(option.image)}
      imageSize={CARD_IMAGE_SIZE}
      link={link}>
      <Typography variant="body2" color="text.secondary">
        {Utils.localizeNation(t, option.nation)}
      </Typography>
    </ActionAreaCard>
  );
}