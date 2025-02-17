export const HOST = process.env.NODE_ENV === 'development' ? `http://localhost:3000` : `${window.location.protocol}//${window.location.host}`;

// Service Layer (deprecated as there is no server anymore)
export const UNIT_OPTIONS_API = '/api/units/options';
export const RESEARCH_OPTIONS_API = '/api/researches/options';
export const RESEARCH_UNIT_OPTIONS_API = '/api/researches/unit-options';
export const LOCALE_OPTIONS_API = '/api/locales/options';
export const NATION_OPTIONS_API = '/api/units/nations';
export const SEARCH_TAGS_OPTIONS_API = '/api/units/search-tags';
export const UNIT_TAGS_OPTIONS_API = '/api/units/unit-tags';
// -----------------------------------------

// WS API ----------------------------------
export const WS_GAMES_API_HOST = 'https://games-api.warselect.io';
export const WS_GAMES_API_REPLAY_BY_CODE = WS_GAMES_API_HOST + "/getByReplay?code="

// -----------------------------------------

export const UNIT_DATA_PATH = '/files/units';
export const RESEARCH_DATA_PATH = '/files/researches';
export const CONTEXT_DATA_PATH = '/files/context.json';
export const UNIT_SELECTOR_DATA_PATH = '/files/units/unitSelector.json';
export const DOCS_DATA_ROOT_PATH = '/files/docs';
export const DOCS_DATA_TREE_PATH = DOCS_DATA_ROOT_PATH + '/tree';
export const DOCS_DATA_TREE_ROOT_FILE_PATH = DOCS_DATA_TREE_PATH + "/home.json";
export const DOCS_DATA_CONTEXT_PATH = DOCS_DATA_ROOT_PATH + '/context';
export const DOCS_DATA_CONTEXT_ROOT_FILE_PATH = DOCS_DATA_CONTEXT_PATH + "/home.json";

export const UNIT_SELECTOR_PAGE_PATH = 'units';
export const RESEARCH_SELECTOR_PAGE_PATH = 'researches';
export const UNIT_PAGE_PATH = 'unit';
export const RESEARCH_PAGE_PATH = 'research';
export const ENV_PAGE_PATH = 'env'; // not used
export const RESOURCE_PAGE_PATH = 'resource'; // not used
export const HOME_PAGE_PATH = 'home';
export const ERROR_PAGE_PATH = 'error';
export const MODS_PAGE_PATH = 'modding';
export const REPLAY_PAGE_PATH = 'replay';
export const REPLAY_INFO_PAGE_PATH = 'info';
export const REPLAY_PLAYER_INFO_PAGE_PATH = 'player';

export const INITIAL_TAB = 'index';

export const UNIT_ABILITIES_TAB = 'abilities';
export const UNIT_WEAPONS_TAB = 'weapons';
export const UNIT_BUILD_TAB = 'build';
export const UNIT_GATHER_TAB = 'gather';
export const UNIT_HEAL_TAB = 'heal';
export const UNIT_CONSTRUCTION_TAB = 'construction';
export const UNIT_AIRPLANE_TAB = 'airplane';
export const UNIT_SUBMARINE_TAB = 'submarine';

export const RESEARCH_UPGRADES_TAB = 'upgrades';

export const PARAM_LOCALE = ':locale';
export const PARAM_GAME_ID = ':gameId';
export const PARAM_TAB = ':tab';
export const PARAM_PLAYER = ':player';
export const PARAM_RESEARCH_IDS = 'researchIds';
export const PARAM_NATIONS = 'nations';
export const PARAM_UNIT_TAGS = 'unitTags';
export const PARAM_SEARCH_TAGS = 'searchTags';
export const PARAM_PATH = 'path';
export const PARAM_REPLAY_CODE = "replayCode";
export const NO_LINK_INDICATOR = 'no-link';

export const DEFAULT_LOCALE_OPTION = 'en';
export const LOCAL_RESIZABLE_WIDTH = 'resizable-width';
export const LOCAL_THEME_MODE = 'theme-provider-mode-is-dark';
export const LOCAL_LAST_LOCALE = 'locale-last-selected';
export const LOCAL_MODS_TREE_CONENT_RESIZABLE_ID = 'mods-page-resizable-tree-content-horizontal';
export const LOCAL_MODS_CONENT_PROPS_RESIZABLE_ID = 'mods-page-resizable-content-props-vertical';
export const LOCAL_MODS_PROPS_TABLE_COLUMNS_RESIZABLE_ID = 'mods-page-resizable-props-table-columns';
export const EXPLORER_PATH_SEPARATOR = '.';
export const EXPLORER_PATH_SEPARATOR_REGEX = /\.|\[/;
export const EXPLORER_PATH_SEPARATOR_END_SQUARE = ']';
export const EXPLORER_PATH_SQUARE_TARGET_REGEX = /^\d/;
export const TREE_HOME_PREFIX = "home";

export const JS_NBSP = '\u00A0';
export const SECONDS_END_MARKER = 'secondsMarker';

export const DEFAULT_COLUMN_WIDTH = 600;
export const FILTER_PANEL_HEIGHT = 120;

export const ABILITY_TYPE_DAMAGE = 6;
export const ENTITY_PICKER_OPTIONS_SIZE = 40;
export const SELECTOR_OPTIONS_SIZE = 20;

export const TICK_RATE = 50;
export const ENGINE_FLOAT_SHIFT = 1000;
export const ENGINE_STORAGE_MULTIPLIER = 100 / 65536;
