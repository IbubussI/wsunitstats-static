import { Button } from "@mui/material";

/**
 * A button that should be used across forms
 */
export const FormButton = (props) => (
  <Button
    {...props}
    children={props.children}
    variant='contained' />
);
