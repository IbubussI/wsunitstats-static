import * as React from 'react';
import * as Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import { autocompleteClasses, inputLabelClasses, outlinedInputClasses, styled, svgIconClasses } from "@mui/material";
import { DynamicSelect } from "components/Atoms/DynamicSelect";
import { useNavigate } from 'react-router-dom';

const StyledDynamicSelect = styled(DynamicSelect)({
  [`& .${autocompleteClasses.inputRoot} .${autocompleteClasses.input}`]: {
    color: 'white',
    borderColor: 'white',
    cursor: 'pointer'
  },
  [`& .${inputLabelClasses.root}`]: {
    color: 'white !important',
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderColor: 'white'
  },
  [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
    borderColor: 'white !important'
  },
  [`&:focus-within .${outlinedInputClasses.notchedOutline}`]: {
    borderColor: 'white !important',
    borderWidth: '1px !important'
  },
  [`& .${svgIconClasses.root}`]: {
    color: 'white'
  },
});

export const LocaleSelector = ({ currentLocale }) => {
  const navigate = useNavigate();
  const [options, setOptions] = React.useState([]);
  const [value, setValue] = React.useState(null);

  const onLocaleChange = React.useCallback((newLocale, replace) => {
    navigate(Utils.getUrlWithPathParams([{ param: newLocale, pos: 1 }]), { replace: replace });
  }, [navigate]);

  React.useEffect(() => {
    fetch(Constants.HOST + Constants.LOCALE_OPTIONS_API)
      .then((response) => response.json())
      .then((options) => setOptions(options))
      .catch(console.log);
  }, []);

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
    <StyledDynamicSelect
      onSelect={(locale) => onLocaleChange(locale, true)}
      getOptionLabel={(locale) => locale.toUpperCase()}
      value={value}
      options={options}
    />
  );
}