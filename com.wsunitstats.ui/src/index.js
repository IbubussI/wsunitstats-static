import ReactDOM from 'react-dom/client';
import './index.css';
import { Footer } from 'components/Footer';
import { Navigate, Outlet, createBrowserRouter, RouterProvider, useLoaderData, useParams } from 'react-router-dom';
import * as Constants from 'utils/constants';
import * as Utils from 'utils/utils';
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

const theme = createTheme({
  palette: {
    secondary: {
      main: "#f3e5f5"
    }
  },
});

const Root = () => {
  const params = useParams();
  const context = useLoaderData();
  const localizedUnitOptions = Utils.localize(context.units, context.localization[params.locale]);
  const localizedResearchOptions = Utils.localize(context.researches, context.localization[params.locale]);
  context.localizedUnits = localizedUnitOptions;
  context.localizedResearches = localizedResearchOptions;

  console.log("Root render")
  console.log("localizedUnitOptions")
  console.log(localizedUnitOptions)
  console.log("context")
  console.log(context)
  console.log("locale")
  console.log(params.locale)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header context={context}/>
      <div className="body-root">
        <Outlet context={context}/>
      </div>
      <Footer />
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

const entityLoader = (param, path) => {
  return fetch(new URL(Constants.HOST + path + "/" + param + ".json"));
};

const unitLoader = (route) => entityLoader(route.params.gameId, Constants.UNIT_DATA_PATH);
const researchLoader = (route) => entityLoader(route.params.gameId, Constants.RESEARCH_DATA_PATH);
const contextLoader = () => fetch(new URL(Constants.HOST + Constants.CONTEXT_DATA_PATH));
const unitSelectorLoader = () => fetch(new URL(Constants.HOST + Constants.UNIT_SELECTOR_DATA_PATH));

const unitSelectorOptions = {
  title: 'WS Units',
  Card: UnitCard,
  getEntityPath: (id) => Utils.getUrlWithPathParams([
    { param: Constants.UNIT_PAGE_PATH, pos: 2 },
    { param: id, pos: 3 },
    { param: Constants.INITIAL_TAB, pos: 4 }
  ]),
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
  ]),
  viewSize: Constants.SELECTOR_OPTIONS_SIZE
};

// 'shouldRevalidate: () => false' here is used to prevent
// loaders refetch data since it is static and does not change.
// Removing it will lead to multiple re-renders with side-effects due to data being refetched every time
const router = createBrowserRouter([
  {
    path: '*',
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
        path: Constants.ERROR_PAGE_PATH,
        element: <ErrorPage />
      },
      {
        path: Constants.HOME_PAGE_PATH,
        element: <HomePage />
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
        shouldRevalidate: () => false,
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
        shouldRevalidate: () => false,
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