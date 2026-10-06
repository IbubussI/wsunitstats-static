import {
  createBrowserRouter,
  Navigate,
  redirect,
  type LoaderFunctionArgs,
  type ShouldRevalidateFunctionArgs
} from 'react-router-dom';
import i18n from '@/i18n';
import * as Constants from '@/utils/constants';
import { parseEntityPath } from '@/utils/utils';
import { useGameDataStore } from '@/store/gameDataStore';
import type { GameContext } from '@/types/game';
import { Root } from '@/Root';
import { ErrorPage } from '@/pages/ErrorPage';
import { HomePage } from '@/pages/HomePage';
import { DocsPage } from '@/pages/DocsPage';
import { ReplayPage } from '@/pages/ReplaysPage';
import { ReplayInfo } from '@/pages/ReplaysPage/ReplayInfo';
import { PlayerInfo } from '@/pages/ReplaysPage/PlayerInfo';
import { UnitSelectorPage } from '@/pages/EntitySelectorPage/UnitSelectorPage';
import { ResearchSelectorPage } from '@/pages/EntitySelectorPage/ResearchSelectorPage';
import { UnitPage } from '@/pages/UnitPage';
import { ResearchPage } from '@/pages/ResearchPage';

/** Fetches a json file, returns null if it is absent */
const fetchJsonFile = async <T,>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(path);
    const contentType = response.headers.get('content-type');
    if (!response.ok || !contentType?.includes('application/json')) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
};

const contextLoader = async ({ params }: LoaderFunctionArgs) => {
  const store = useGameDataStore.getState();
  const [context] = await Promise.all([
    // context does not depend on locale, so it is loaded once
    store.context ?? fetchJsonFile<GameContext>(Constants.CONTEXT_DATA_PATH),
    i18n.changeLanguage(params.locale)
  ]);
  if (!context) {
    throw new Error('Cannot load game data');
  }
  store.setContext(context);
  return null;
};

/**
 * Loads unit/research data. Entity id is a path (several url segments) followed by the tab.
 * Redirects to the default tab if it is absent in the url
 */
const entityLoader = (dataPath: string, tabs: string[]) => async ({ params, request }: LoaderFunctionArgs) => {
  const { id, tab } = parseEntityPath(params['*'] ?? '', tabs);
  if (!tab) {
    const url = new URL(request.url);
    return redirect(`${url.pathname.replace(/\/$/, '')}/${Constants.INITIAL_TAB}${url.search}`);
  }
  return fetchJsonFile(`${dataPath}/${id}.json`);
};

/** Reload entity only when another entity is opened (not on tab or research change) */
const entityShouldRevalidate = (tabs: string[]) => ({ currentParams, nextParams }: ShouldRevalidateFunctionArgs) =>
  currentParams.locale !== nextParams.locale
  || parseEntityPath(currentParams['*'] ?? '', tabs).id !== parseEntityPath(nextParams['*'] ?? '', tabs).id;

const localePreference = localStorage.getItem(Constants.LOCAL_LAST_LOCALE) || Constants.DEFAULT_LOCALE_OPTION;

// Data is static, so loaders are not re-run unless their params change ('shouldRevalidate')
export const router = createBrowserRouter([
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
        element: <Navigate to={Constants.ERROR_PAGE_PATH} state={{ msg: 'Not found', code: 404 }} replace />
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
        loader: () => fetchJsonFile(Constants.DOCS_DATA_TREE_ROOT_FILE_PATH),
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
                path: Constants.REPLAY_INFO_PAGE_PATH,
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
        element: <UnitSelectorPage />,
        loader: () => fetchJsonFile(Constants.UNIT_SELECTOR_DATA_PATH),
        shouldRevalidate: () => false,
      },
      {
        path: `${Constants.UNIT_PAGE_PATH}/*`,
        element: <UnitPage />,
        loader: entityLoader(Constants.UNIT_DATA_PATH, Constants.UNIT_TABS),
        shouldRevalidate: entityShouldRevalidate(Constants.UNIT_TABS)
      },
      {
        path: Constants.RESEARCH_SELECTOR_PAGE_PATH,
        element: <ResearchSelectorPage />
      },
      {
        path: `${Constants.RESEARCH_PAGE_PATH}/*`,
        element: <ResearchPage />,
        loader: entityLoader(Constants.RESEARCH_DATA_PATH, Constants.RESEARCH_TABS),
        shouldRevalidate: entityShouldRevalidate(Constants.RESEARCH_TABS)
      },
    ],
  },
]);
