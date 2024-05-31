import { Paper } from "@mui/material";

export const BasicPaper = (props) => {
  return <Paper ref={props.innerref} elevation={3} {...props} />;
}; 