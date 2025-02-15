import * as React from 'react';
import * as Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import {
  autocompleteClasses,
  inputBaseClasses,
  Stack,
  styled,
  Tooltip
} from "@mui/material";
import { DynamicSelect } from "components/Atoms/DynamicSelect";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const StyledDynamicSelect = styled(DynamicSelect)({
  [`& .${autocompleteClasses.inputRoot}, .${autocompleteClasses.input}, .${inputBaseClasses.root}`]: {
    cursor: 'pointer',
    userSelect: 'none'
  },
});

export const LocaleSelector = (props) => {
  const {
    currentLocale,
    options,
    ...otherProps
  } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = React.useState(null);

  const onLocaleChange = React.useCallback((newLocale, replace) => {
    navigate(Utils.getUrlWithPathParams([{ param: newLocale, pos: 1 }]), { replace: replace });
  }, [navigate]);

  React.useEffect(() => {
    if (options.length > 0) {
      let actualOption = currentLocale;
      if (!options.includes(currentLocale)) {
        actualOption = Constants.DEFAULT_LOCALE_OPTION;
        onLocaleChange(actualOption, false);
      }
      setValue(actualOption);
    }
  }, [currentLocale, options, onLocaleChange]);

  return (
    <Stack {...otherProps} style={{ gap: 1, alignItems: 'center', flexDirection: 'row', py: 1 }}>
      <StyledDynamicSelect
        onSelect={(locale) => onLocaleChange(locale, true)}
        getOptionLabel={(locale) => locale.toUpperCase()}
        value={value}
        options={options}
      />
      {currentLocale !== Constants.DEFAULT_LOCALE_OPTION &&
        <Tooltip arrow title={t('localeSelectorWarn')}>
          <WarningAmberIcon style={{ color: '#fd853c', filter: 'drop-shadow(0px 0px 3px rgb(0 0 0 / 0.8))', fontSize: 25 }} />
        </Tooltip>}
    </Stack>
  );
}