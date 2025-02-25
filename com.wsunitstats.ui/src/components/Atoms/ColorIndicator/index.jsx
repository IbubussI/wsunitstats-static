import { Box } from "@mui/material";

export const ColorIndicator = (props) => {
  const {
    color,
    ...forwardedProps
  } = props;
  return (
    <Box {...forwardedProps}
      style={{
        backgroundColor: color,
        borderRadius: '15%',
        boxShadow: '0 0 3px #0000008a'
      }} />
  );
};
