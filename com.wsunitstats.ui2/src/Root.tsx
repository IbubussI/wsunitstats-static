import * as React from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import * as Constants from '@/utils/constants';
import { navigateToError } from '@/utils/utils';
import { useGameContext } from '@/store/gameDataStore';
import { useThemeStore } from '@/store/themeStore';
import { darkTheme, lightTheme } from '@/theme';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/** Layout of all pages: theme, header, page, footer */
export const Root = () => {
  const { locale } = useParams();
  const navigate = useNavigate();
  const { localeOptions } = useGameContext();
  const isDark = useThemeStore((state) => state.isDark);

  React.useEffect(() => {
    if (locale && localeOptions.includes(locale)) {
      localStorage.setItem(Constants.LOCAL_LAST_LOCALE, locale);
    } else if (locale !== Constants.DEFAULT_LOCALE_OPTION) {
      navigateToError(navigate, 'Requested locale not found', 404, false);
    }
  }, [locale, localeOptions, navigate]);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <Header />
      <div className="body-root">
        <Outlet />
      </div>
      <Footer />
    </ThemeProvider>
  );
};
