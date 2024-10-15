import ReactDOM from 'react-dom/client';
import './index.css';
import { Footer } from 'components/Footer';
import { Navigate, Outlet, createBrowserRouter, RouterProvider, useLoaderData, useParams } from 'react-router-dom';
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

const theme = createTheme({
  palette: {
    secondary: {
      main: "#f3e5f5"
    },
    action: {
      selected: 'rgba(23, 118, 212, 0.3)',
      hover: 'rgba(0, 0, 0, 0.1)'
    }
  },
});

const Root = () => {
  const params = useParams();
  const context = useLoaderData();
  const localizationData = context.localization[params.locale];
  if (!localizationData && params.locale !== Constants.DEFAULT_LOCALE_OPTION) {
    return <Navigate
      to={`/${Constants.DEFAULT_LOCALE_OPTION}/${Constants.ERROR_PAGE_PATH}`}
      state={{ msg: "Requested locale not found", code: 404 }} replace={true} />;
  }

  const localizedUnitOptions = Utils.localize(context.units, localizationData);
  const localizedResearchOptions = Utils.localize(context.researches, localizationData);
  context.localizedUnits = localizedUnitOptions;
  context.localizedResearches = localizedResearchOptions;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header context={context} />
      <div className="body-root">
        <Outlet context={context} />
      </div>
      <Footer />
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

const entityLoader = async (route, path) => {
  return fetch(new URL(Constants.HOST + path + "/" + route.params.gameId + ".json"));
};

const unitLoader = (route) => entityLoader(route, Constants.UNIT_DATA_PATH);
const researchLoader = (route) => entityLoader(route, Constants.RESEARCH_DATA_PATH);
const contextLoader = () => fetch(new URL(Constants.HOST + Constants.CONTEXT_DATA_PATH));
const unitSelectorLoader = () => fetch(new URL(Constants.HOST + Constants.UNIT_SELECTOR_DATA_PATH));

const unitSelectorOptions = {
  title: 'WS Units',
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
  return context.localizedUnits.filter(option =>
    (!nations || nations.some(nation => option.nationId === nation)) &&
    (!searchTags || searchTags.some(searchTag => option.searchTags.includes(searchTag))) &&
    (!unitTags || unitTags.some(unitTag => option.unitTags.includes(unitTag))));
};

const researchSelectorOptions = {
  title: 'WS Researches',
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
    element: <Navigate to={Constants.DEFAULT_LOCALE_OPTION} replace />
  },
  {
    path: `/${Constants.PARAM_LOCALE}`,
    element: <Root />,
    loader: contextLoader,
    shouldRevalidate: () => false,
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
        element: <DocsPage />
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
        element: <EntitySelectorPage selectorOptions={researchSelectorOptions} getSelectorOptions={(context) => context.localizedResearches} />
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