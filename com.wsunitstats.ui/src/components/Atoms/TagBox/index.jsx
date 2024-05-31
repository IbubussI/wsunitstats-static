import { Box, Stack, Typography } from "@mui/material";
import { Text } from "components/Atoms/Renderer";
import { PopperTag } from "components/Atoms/ButtonPopper";

export const TagBox = ({ tagsData }) => {
  return (
    <Box sx={{ padding: '7px' }}>
      <Text data={tagsData.label} />
      <Stack direction='row' sx={{ paddingTop: '3px', gap: '3px', flexWrap: 'wrap' }}>
        {tagsData.tags
          ? tagsData.tags.map((tag, index) => (
            <PopperTag key={index} tag={tag} placement='bottom'/>
          ))
          : <Typography>{'\u2013'}</Typography>}
      </Stack>
    </Box>
  );
}