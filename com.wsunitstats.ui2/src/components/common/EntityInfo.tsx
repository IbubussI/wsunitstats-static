import { Box, Link, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Image } from '@/components/common/Image';
import { entityUrl, type EntityRoute } from '@/utils/utils';
import type { EntityId } from '@/types/game';

interface EntityInfoProps {
  primary: string;
  secondary?: string;
  image: string;
  imageSize?: number;
  /** page of the entity, no link if absent */
  route?: EntityRoute | null;
  id?: EntityId;
  /** clamp long names with ellipsis */
  overflow?: boolean;
  clearLinkStyle?: boolean;
  sx?: SxProps<Theme>;
}

/** Image + name (+ secondary text) of an entity linking to its page */
export const EntityInfo = ({
  primary,
  secondary,
  image,
  imageSize = 35,
  route,
  id,
  overflow,
  clearLinkStyle,
  sx
}: EntityInfoProps) => {
  const { locale } = useParams();
  const overflowSx = overflow ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: secondary ? 1 : 2,
    WebkitBoxOrient: 'vertical',
  } : {};

  const content = (
    <Stack direction='row' alignItems='center'>
      <Stack sx={{ marginRight: 0.4, height: 'fit-content' }}>
        <Image path={image} width={imageSize} height={imageSize} />
      </Stack>
      <Stack minWidth={overflow ? 0 : undefined}>
        <Typography variant='body2' lineHeight={1.2} sx={overflowSx}>
          {primary}
        </Typography>
        {secondary && <Typography variant='caption' lineHeight={1.2}>
          {secondary}
        </Typography>}
      </Stack>
    </Stack>
  );

  return (
    <Box sx={sx}>
      {route && id != null
        ? <Link to={entityUrl(locale, route, id)} component={RouterLink}
          sx={{ textDecoration: clearLinkStyle ? 'none' : undefined }}>
          {content}
        </Link>
        : content}
    </Box>
  );
};
