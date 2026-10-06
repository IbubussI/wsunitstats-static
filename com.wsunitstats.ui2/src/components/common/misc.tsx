import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Stack,
  styled,
  TableRow,
  Tooltip,
  Typography,
  type AlertColor,
  type BoxProps,
  type ButtonProps,
  type SnackbarProps,
  type StackProps
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { resolveImage } from '@/utils/utils';

/** A button that should be used across forms */
export const FormButton = (props: ButtonProps) => <Button {...props} variant='contained' />;

export const NoBottomBorderRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': { border: 0 }
}));

export const ColorIndicator = ({ color, ...forwardedProps }: BoxProps & { color: string }) => (
  <Box {...forwardedProps}
    style={{
      backgroundColor: color,
      borderRadius: '15%',
      boxShadow: '0 0 3px #0000008a'
    }} />
);

type InfoSnackbarProps = Omit<SnackbarProps, 'children'> & {
  severity: AlertColor;
  children: React.ReactNode;
};

export const InfoSnackbar = ({ severity, children, ...forwardedProps }: InfoSnackbarProps) => (
  <Snackbar
    {...forwardedProps}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <Alert
      severity={severity}
      variant="filled"
      sx={{ width: '100%', px: '14px', py: '2px' }}>
      {children}
    </Alert>
  </Snackbar>
);

const CopyButton = styled(Button)(() => ({
  padding: '5px',
  margin: '-5px'
}));

/** A text with copy button and snackbar message */
export const CopyText = ({ text, ...forwardedProps }: StackProps & { text: string }) => {
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

/** Big framed entity image */
export const EntityImage = ({ image, size }: { image: string; size: string }) => (
  <Stack sx={{
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid',
  }}>
    <img style={{ border: '5px solid #555', boxSizing: 'border-box' }} src={resolveImage(image)} alt="" />
  </Stack>
);

/** Primary text with secondary line, e.g. "Area" / "radius: 5, angle: 20" */
export const SubValue = ({ primary, sub }: { primary: React.ReactNode; sub?: React.ReactNode }) => (
  <>
    <Typography variant='body2' color='text.primary' lineHeight={1.2}>
      {primary}
    </Typography>
    {sub && <Typography variant='caption' color='text.secondary' lineHeight={1.2}>
      {sub}
    </Typography>}
  </>
);

/** Row of resource icons with values */
export const ResourceIcons = ({ resources }: { resources: { resourceName: string; image: string; value: number }[] }) => {
  const { t } = useTranslation();
  return (
    <Stack direction='row' spacing={0.7} sx={{ width: 'fit-content', margin: '5px', marginLeft: '0' }}>
      {resources.map((resource, index) =>
        <Tooltip key={index} title={t(resource.resourceName)}>
          <Stack direction='column' alignItems='center' sx={{ minWidth: '50px' }}>
            <Box component='img' src={resolveImage(resource.image)} width={25} height={25} alt='' />
            <Typography variant='body2' color='text.primary'>
              {resource.value}
            </Typography>
          </Stack>
        </Tooltip>
      )}
    </Stack>
  );
};
