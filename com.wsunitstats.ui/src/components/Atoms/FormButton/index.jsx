import { Button } from "@mui/material";

export const FormButton = (props) => (
  <Button
    {...props}
    children={props.children}
    variant='outlined'
    sx={{
      backgroundColor: props.disabled ? "rgba(121, 131, 141, 0.1)" : "rgba(44, 138, 232, 0.1)",
      "&:hover": { backgroundColor: "rgba(12, 127, 241, 0.26)" }
    }} />
);