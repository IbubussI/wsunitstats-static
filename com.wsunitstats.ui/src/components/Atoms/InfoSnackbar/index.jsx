import * as React from "react";
import { Alert, Snackbar } from "@mui/material";

export const InfoSnackbar = (props) => {
  const {
    severity,
    children,
    ...forwardedProps
  } = props;

  return (
    <Snackbar
      {...forwardedProps}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        variant="filled"
        sx={{ width: '100%', px: '14px', py: '2px' }}
      >
        {children}
      </Alert>
    </Snackbar>
  );
};
