import ReactDOM from 'react-dom/client';
import './index.css';
import { Footer } from 'components/Footer';
import {
  Navigate,
  Outlet,
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  useParams,
  useNavigate
} from 'react-router-dom';
import * as Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import * as React from 'react';
import { Header } from 'components/Header';
import { ErrorPage } from 'components/Pages/ErrorPage';
import { EntityPage } from 'components/Pages/EntityPage';
import { UnitPage } from 'components/Pages/UnitPage';
import { ResearchPage } from 'components/Pages/ResearchPage';
import { HomePage } from 'components/Pages/HomePage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ResearchCard } from 'components/Pages/ResearchPage/ResearchCard';
import { UnitCard } from 'components/Pages/UnitPage/UnitCard';
import { UnitFilters } from 'components/Pages/EntitySelectorPage/Filters/UnitFilters';
import { EntitySelectorPage } from 'components/Pages/EntitySelectorPage';
import { DocsPage } from 'components/Pages/DocsPage';
import { ReplayInfo } from 'components/Pages/ReplaysPage/ReplayInfo';
import i18n from './i18n';
import { ThemeContext } from 'themeContext';
import { PlayerInfo } from 'components/Pages/ReplaysPage/PlayerInfo';
import { ReplayPage } from 'components/Pages/ReplaysPage';
import { GameDataContext } from 'gameDataContext';

const lightTheme = createTheme({
  palette: {
    docs: {
      main: '#a6daff',
      input: {
        gStart: '#daf1f7',
        gEnd: '#fff0'
      },
      propTable: {
        idCell: {
          gStart: '#d9f1fc',
          gEnd: '#acdafc'
        }
      }
    }
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    docs: {
      main: 'initial',
      input: {
        gStart: '#181818',
        gEnd: '#fff0'
      },
      propTable: {
        idCell: {
          gStart: '#0003',
          gEnd: '#fff0'
        }
      }
    }
  },
});

const themes = {
  dark: {
    localKey: 'dark',
    theme: darkTheme
  },
  light: {
    localKey: 'light',
    theme: lightTheme
  }
}

const changeLocalTheme = (isDark) => {
  localStorage.setItem(Constants.LOCAL_THEME_MODE, isDark);
};

const getClientIsDark = () => {
  const isDark = localStorage.getItem(Constants.LOCAL_THEME_MODE);
  if (isDark != null) {
    return isDark === 'true';
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return false;
  } else {
    return true;
  }
};

const localePreference = localStorage.getItem(Constants.LOCAL_LAST_LOCALE) || Constants.DEFAULT_LOCALE_OPTION;

const Root = () => {
  const params = useParams();
  const gameContext = useLoaderData();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(() => getClientIsDark());

  React.useEffect(() => {
    const isLocale = gameContext.localeOptions.includes(params.locale);
    if (!isLocale && params.locale !== Constants.DEFAULT_LOCALE_OPTION) {
      Utils.navigateToError(navigate, "Requested locale not found", 404, false);
    } else {
      localStorage.setItem(Constants.LOCAL_LAST_LOCALE, params.locale);
    }
  }, [params.locale, gameContext.localeOptions, navigate]);

  const updateTheme = (isDark) => {
    changeLocalTheme(isDark);
    setIsDark(isDark);
  }

  return (
    <ThemeProvider theme={isDark ? themes.dark.theme : themes.light.theme}>
      <ThemeContext.Provider value={{ isDark: isDark, updateTheme: updateTheme }}>
        <GameDataContext.Provider value={gameContext}>
          <CssBaseline />
          <Header />
          <div className="body-root">
            <Outlet />
          </div>
          <Footer />
        </GameDataContext.Provider>
      </ThemeContext.Provider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

const entityLoader = async (route, path) => {
  return fetch(new URL(Constants.HOST + path + "/" + route.params.gameId + ".json"));
};

const unitLoader = (route) => entityLoader(route, Constants.UNIT_DATA_PATH);
const researchLoader = (route) => entityLoader(route, Constants.RESEARCH_DATA_PATH);
const unitSelectorLoader = () => fetch(new URL(Constants.HOST + Constants.UNIT_SELECTOR_DATA_PATH));
const docsLoader = () => fetch(new URL(Constants.HOST + Constants.DOCS_DATA_TREE_ROOT_FILE_PATH));
const contextLoader = (route) => Promise.all([
  // potentially there is no need to reload context on locale change
  // need a way to setup multiple loaders conditionally
  // or use one more level of components for localization
  fetch(new URL(Constants.HOST + Constants.CONTEXT_DATA_PATH)),
  i18n.changeLanguage(route.params.locale)
]).then(result => result[0]);

const unitSelectorOptions = {
  title: 'entityPageTitleUnits',
  Card: UnitCard,
  getEntityPath: (id) => Utils.getUrlWithPathParams([
    { param: Constants.UNIT_PAGE_PATH, pos: 2 },
    { param: id, pos: 3 },
    { param: Constants.INITIAL_TAB, pos: 4 }
  ], false),
  Filters: UnitFilters,
  viewSize: Constants.SELECTOR_OPTIONS_SIZE
};

const filterUnitSelectorOptions = (context, searchParams) => {
  const nations = searchParams.get(Constants.PARAM_NATIONS)?.split(',').map(v => Number(v)).filter(v => !isNaN(v));
  const searchTags = searchParams.get(Constants.PARAM_SEARCH_TAGS)?.split(',').map(v => Number(v)).filter(v => !isNaN(v));
  const unitTags = searchParams.get(Constants.PARAM_UNIT_TAGS)?.split(',').map(v => Number(v)).filter(v => !isNaN(v));
  return context.units.filter(option =>
    (!nations || nations.some(nation => option.nationId === nation)) &&
    (!searchTags || searchTags.some(searchTag => option.searchTags.includes(searchTag))) &&
    (!unitTags || unitTags.some(unitTag => option.unitTags.includes(unitTag))));
};

const researchSelectorOptions = {
  title: 'entityPageTitleResearches',
  Card: ResearchCard,
  getEntityPath: (id) => Utils.getUrlWithPathParams([
    { param: Constants.RESEARCH_PAGE_PATH, pos: 2 },
    { param: id, pos: 3 },
    { param: Constants.INITIAL_TAB, pos: 4 }
  ], false),
  viewSize: Constants.SELECTOR_OPTIONS_SIZE
};

// 'shouldRevalidate: () => false' here is used to prevent
// loaders refetch data since it is static and does not change.
// Removing it will lead to multiple re-renders with side-effects due to data being refetched every time
const router = createBrowserRouter([
  {
    index: true,
    element: <Navigate to={localePreference} replace />
  },
  {
    path: `/${Constants.PARAM_LOCALE}`,
    element: <Root />,
    loader: contextLoader,
    shouldRevalidate: ({ currentParams, nextParams }) => currentParams.locale !== nextParams.locale,
    children: [
      {
        index: true,
        element: <Navigate to={Constants.UNIT_SELECTOR_PAGE_PATH} replace />
      },
      {
        path: '*',
        element: <Navigate to={Constants.ERROR_PAGE_PATH} state={{ msg: "Not found", code: 404 }} replace />
      },
      {
        path: Constants.ERROR_PAGE_PATH,
        element: <ErrorPage />
      },
      {
        path: Constants.HOME_PAGE_PATH,
        element: <HomePage />
      },
      {
        path: Constants.MODS_PAGE_PATH,
        element: <DocsPage />,
        loader: docsLoader,
        shouldRevalidate: () => false,
      },
      {
        path: Constants.REPLAY_PAGE_PATH,
        element: <ReplayPage />,
        children: [
          {
            path: Constants.PARAM_REPLAY_CODE,
            children: [
              {
                index: true,
                element: <Navigate to={Constants.REPLAY_INFO_PAGE_PATH} replace />
              },
              {
                path: `${Constants.REPLAY_INFO_PAGE_PATH}`,
                element: <ReplayInfo />,
              },
              {
                path: `${Constants.REPLAY_PLAYER_INFO_PAGE_PATH}/${Constants.PARAM_PLAYER}`,
                element: <PlayerInfo />
              },
            ]
          }
        ]
      },
      {
        path: Constants.UNIT_SELECTOR_PAGE_PATH,
        element: <EntitySelectorPage selectorOptions={unitSelectorOptions} getSelectorOptions={filterUnitSelectorOptions} />,
        loader: unitSelectorLoader,
        shouldRevalidate: () => false,
      },
      {
        path: `${Constants.UNIT_PAGE_PATH}/${Constants.PARAM_GAME_ID}`,
        element: <EntityPage />,
        loader: unitLoader,
        children: [
          {
            index: true,
            element: <Navigate to={Constants.INITIAL_TAB} replace />
          },
          {
            path: `${Constants.PARAM_TAB}`,
            element: <UnitPage />
          },
        ]
      },
      {
        path: Constants.RESEARCH_SELECTOR_PAGE_PATH,
        element: <EntitySelectorPage selectorOptions={researchSelectorOptions} getSelectorOptions={(context) => context.researches} />
      },
      {
        path: `${Constants.RESEARCH_PAGE_PATH}/${Constants.PARAM_GAME_ID}`,
        element: <EntityPage />,
        loader: researchLoader,
        children: [
          {
            index: true,
            element: <Navigate to={Constants.INITIAL_TAB} replace />
          },
          {
            path: `${Constants.PARAM_TAB}`,
            element: <ResearchPage />
          },
        ]
      },
    ],
  },
]);

root.render(
  <div className='page-root'>
    <RouterProvider router={router} />
  </div>
);
