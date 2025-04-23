import * as React from 'react';
import * as Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import {
  Stack,
  Tooltip
} from "@mui/material";
import { SingleSelect } from "components/Atoms/SingleSelect";
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export const LocaleSelector = (props) => {
  const {
    options,
    ...otherProps
  } = props;
  const { locale } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = React.useState(null);

  const onLocaleChange = React.useCallback((newLocale, replace) => {
    navigate(Utils.getUrlWithPathParams([{ param: newLocale, pos: 1 }]), { replace: replace });
  }, [navigate]);

  React.useEffect(() => {
    if (options.length > 0) {
      let actualOption = locale;
      if (!options.includes(locale)) {
        actualOption = Constants.DEFAULT_LOCALE_OPTION;
        onLocaleChange(actualOption, false);
      }
      setValue(actualOption);
    }
  }, [locale, options, onLocaleChange]);

  return (
    <Stack {...otherProps} style={{ gap: 1, alignItems: 'center', flexDirection: 'row', py: 1 }}>
      <SingleSelect
        onChange={(locale) => onLocaleChange(locale, true)}
        getOptionLabel={(locale) => locale.toUpperCase()}
        value={value}
        options={options}
      />
      {locale !== Constants.DEFAULT_LOCALE_OPTION &&
        <Tooltip arrow title={t('localeSelectorWarn')}>
          <WarningAmberIcon style={{ color: '#fd853c', filter: 'drop-shadow(0px 0px 3px rgb(0 0 0 / 0.8))', fontSize: 25 }} />
        </Tooltip>}
    </Stack>
  );
};
