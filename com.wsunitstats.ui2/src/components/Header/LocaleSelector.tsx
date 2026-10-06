import { Stack, Tooltip, type SxProps, type Theme } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { getUrlWithPathParams } from '@/utils/utils';
import { useGameContext } from '@/store/gameDataStore';
import { SingleSelect } from '@/components/common/SingleSelect';

export const LocaleSelector = ({ sx }: { sx?: SxProps<Theme> }) => {
  const { locale } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localeOptions } = useGameContext();
  const value = locale && localeOptions.includes(locale) ? locale : Constants.DEFAULT_LOCALE_OPTION;

  return (
    <Stack sx={sx} style={{ gap: 1, alignItems: 'center', flexDirection: 'row' }}>
      <SingleSelect<string>
        onChange={(newLocale) => navigate(getUrlWithPathParams([{ param: newLocale, pos: 1 }]), { replace: true })}
        getOptionLabel={(option) => option.toUpperCase()}
        value={value}
        options={localeOptions}
      />
      {locale !== Constants.DEFAULT_LOCALE_OPTION &&
        <Tooltip arrow title={t('localeSelectorWarn')}>
          <WarningAmberIcon style={{ color: '#fd853c', filter: 'drop-shadow(0px 0px 3px rgb(0 0 0 / 0.8))', fontSize: 25 }} />
        </Tooltip>}
    </Stack>
  );
};
