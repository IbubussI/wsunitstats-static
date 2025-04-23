import * as React from "react";
import { Button, Stack, styled, Typography } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from "react-i18next";
import { InfoSnackbar } from "components/Atoms/InfoSnackbar";

const CopyButton = styled(Button)(() => ({
  padding: '5px',
  margin: '-5px'
}));

/**
 * A text with copy button and snackbar message
 */
export const CopyText = (props) => {
  const {
    text,
    ...forwardedProps
  } = props;
  const { t } = useTranslation();
  const [snackOpen, setSnackOpen] = React.useState(false);

  const handleClick = () => {
    setSnackOpen(true);
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <CopyButton onClick={handleClick} color="primary" size="small" sx={{ textTransform: 'none' }}>
        <Stack direction="row" gap={0.5} {...forwardedProps}>
          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1 }}>
            {text}
          </Typography>
          <ContentCopyIcon sx={{ fontSize: 14 }} />
        </Stack>
      </CopyButton>
      <InfoSnackbar
        severity="success"
        autoHideDuration={1000}
        onClose={() => setSnackOpen(false)}
        open={snackOpen}>
        {t('snackCopiedToClipboard')}
      </InfoSnackbar>
    </>
  );
};