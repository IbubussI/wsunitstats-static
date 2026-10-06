import { Box, Stack, Typography } from '@mui/material';
import { PopperTag } from '@/components/common/ButtonPopper';
import type { Tag } from '@/types/game';

/** Titled list of tag chips */
export const TagBox = ({ label, tags }: { label: string; tags?: Tag[] }) => (
  <Box sx={{ padding: '7px' }}>
    <Typography variant='body2' color='text.primary'>
      {label}
    </Typography>
    <Stack direction='row' sx={{ paddingTop: '3px', gap: '3px', flexWrap: 'wrap' }}>
      {tags?.length
        ? tags.map((tag, index) => <PopperTag key={index} tag={tag} placement='bottom' />)
        : <Typography>{'–'}</Typography>}
    </Stack>
  </Box>
);

/** Vertical list of tag chips (used as a table value) */
export const TagList = ({ tags }: { tags: Tag[] }) => (
  <>
    {tags.map((tag, index) => (
      <Box key={index} sx={{ paddingBottom: '2px' }}>
        <PopperTag tag={tag} placement='right' />
      </Box>
    ))}
  </>
);
