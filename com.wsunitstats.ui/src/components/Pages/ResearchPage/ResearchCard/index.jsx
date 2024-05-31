import * as Utils from 'utils/utils';
import { Typography } from "@mui/material"
import { ActionAreaCard } from 'components/Atoms/Card/Card';

const CARD_WIDTH = 210
const CARD_IMAGE_SIZE = 50

export const ResearchCard = ({ option, onClick }) => {
  return (
    <ActionAreaCard
      id={option.gameId}
      size={CARD_WIDTH}
      name={option.name}
      image={Utils.resolveImage(option.image)}
      imageSize={CARD_IMAGE_SIZE}
      onClick={onClick}>
      <Typography variant="body2" color="text.secondary">
        {option.description}
      </Typography>
    </ActionAreaCard>
  );
}