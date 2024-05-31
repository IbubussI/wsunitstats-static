import ReactDOM from 'react-dom/client';
import './index.css';
import { Footer } from 'components/Footer';
import { Navigate, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <div className="body-root">
        <Outlet />
      </div>
      <Footer />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

const entityLoader = (route, apiPath) => {
  const searchParams = new URLSearchParams(new URL(route.request.url).searchParams);
  searchParams.set('gameIds', route.params.gameId);
  searchParams.set('locale', route.params.locale);
  const apiUrl = new URL(Constants.HOST + apiPath);
  apiUrl.search = searchParams;
  return fetch(apiUrl);
}

const unitLoader = (route) => entityLoader(route, Constants.UNIT_DATA_API);
const researchLoader = (route) => entityLoader(route, Constants.RESEARCH_DATA_API);

const unitSelectorOptions = {
  title: 'WS Units',
  Card: UnitCard,
  getEntityPath: (id) => Utils.getUrlWithPathParams([
    { param: Constants.UNIT_PAGE_PATH, pos: 2 },
    { param: id, pos: 3 },
    { param: Constants.INITIAL_TAB, pos: 4 }
  ]),
  Filters: UnitFilters, 
  optionsSize: Constants.SELECTOR_OPTIONS_SIZE,
  apiPath:  Constants.UNIT_OPTIONS_API
}

const researchSelectorOptions = {
  title: 'WS Researches',
  Card: ResearchCard,
  getEntityPath: (id) => Utils.getUrlWithPathParams([
    { param: Constants.RESEARCH_PAGE_PATH, pos: 2 },
    { param: id, pos: 3 },
    { param: Constants.INITIAL_TAB, pos: 4 }
  ]),
  optionsSize: Constants.SELECTOR_OPTIONS_SIZE,
  apiPath:  Constants.RESEARCH_OPTIONS_API
}

const router = createBrowserRouter([
  {
    path: '*',
    element: <Navigate to={Constants.DEFAULT_LOCALE_OPTION} replace />
  },
  {
    path: `/${Constants.PARAM_LOCALE}`,
    element: <Root />,
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
        element: <EntitySelectorPage selectorOptions={unitSelectorOptions} />,
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
        element: <EntitySelectorPage selectorOptions={researchSelectorOptions} />,
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