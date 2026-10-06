import { Avatar, Box, Chip, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HeaderChipProps {
  /** short id shown in the circle, e.g. W0 */
  id: string | number;
  label?: string;
  tooltip?: string;
  disabled?: boolean;
}

/** Chip placed on the border of a frame to name it */
export const HeaderChip = ({ id, label, tooltip, disabled }: HeaderChipProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const color = disabled ? 'error.main' : 'text.secondary';
  const textColor = disabled ? 'error.main' : 'text.primary';
  const borderColor = disabled ? 'error.main' : 'primary.dark';
  const isLabel = !!label || disabled;
  return (
    <Box sx={{
      border: '1px solid',
      borderColor: borderColor,
      color: color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      height: '32px',
      backgroundColor: theme.palette.background.paper,
    }}>
      <Tooltip title={tooltip}>
        <Avatar sx={{
          fontWeight: 'inherit',
          border: '1px solid',
          width: '24px',
          height: '24px',
          fontSize: '0.75rem',
          color: color,
          marginLeft: isLabel ? '4px' : '3px',
          marginRight: isLabel ? '-6px' : '3px'
        }}>
          {id}
        </Avatar>
      </Tooltip>
      {isLabel && <Stack alignItems='center' sx={{ px: '12px' }}>
        {label &&
          <Typography
            variant='body2'
            sx={{
              fontWeight: 'inherit',
              fontSize: disabled ? 12 : 14,
              lineHeight: 1.1,
              color: textColor,
              paddingBottom: disabled ? '1px' : '',
              marginTop: disabled ? '-3px' : ''
            }}>
            {label}
          </Typography>}
        {disabled &&
          <Chip
            label={t('disabledHeaderChip')}
            color='error'
            sx={{
              textTransform: 'uppercase',
              fontSize: '11px',
              height: '13px',
              '& > .MuiChip-label': {
                padding: '4px'
              }
            }} />}
      </Stack>}
    </Box>
  );
};
