import { Stack } from "@mui/material";

export const EntityImage = ({ image, width, height }) => {
  return (
    <Stack sx={{
      width: width,
      height: height,
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid',
    }}>
      <img style={{ border: '5px solid #555', boxSizing: 'border-box' }} src={`/files/images/${image}`} alt="" />
    </Stack>
  );
}