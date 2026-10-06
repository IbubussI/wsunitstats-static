// WS API ----------------------------------
export const WS_GAMES_API_HOST = 'https://games-api.warselect.io';
export const WS_GAMES_API_REPLAY_BY_CODE = WS_GAMES_API_HOST + '/getByReplay?code=';
// -----------------------------------------

export const FILES_PATH = '/files';
export const IMAGES_PATH = FILES_PATH + '/images';
export const UNIT_DATA_PATH = FILES_PATH + '/units';
export const RESEARCH_DATA_PATH = FILES_PATH + '/researches';
export const CONTEXT_DATA_PATH = FILES_PATH + '/context.json';
export const UNIT_SELECTOR_DATA_PATH = FILES_PATH + '/units/unitSelector.json';
export const DOCS_DATA_ROOT_PATH = FILES_PATH + '/docs';
export const DOCS_DATA_TREE_PATH = DOCS_DATA_ROOT_PATH + '/tree';
export const DOCS_DATA_TREE_ROOT_FILE_PATH = DOCS_DATA_TREE_PATH + '/home.json';
export const DOCS_DATA_CONTEXT_PATH = DOCS_DATA_ROOT_PATH + '/context';
/** Snapshot of the game file legacyIds.json, maps legacy numeric unit ids of old replays to path ids */
export const LEGACY_IDS_PATH = '/static/legacyIds.json';

export const UNIT_SELECTOR_PAGE_PATH = 'units';
export const RESEARCH_SELECTOR_PAGE_PATH = 'researches';
export const UNIT_PAGE_PATH = 'unit';
export const RESEARCH_PAGE_PATH = 'research';
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

export const UNIT_TABS = [
  INITIAL_TAB,
  UNIT_WEAPONS_TAB,
  UNIT_ABILITIES_TAB,
  UNIT_BUILD_TAB,
  UNIT_CONSTRUCTION_TAB,
  UNIT_GATHER_TAB,
  UNIT_HEAL_TAB,
  UNIT_AIRPLANE_TAB,
  UNIT_SUBMARINE_TAB
];
export const RESEARCH_TABS = [INITIAL_TAB];

export const PARAM_LOCALE = ':locale';
export const PARAM_PLAYER = ':player';
export const PARAM_REPLAY_CODE = ':replayCode';
export const PARAM_RESEARCH_IDS = 'researchIds';
export const PARAM_NATIONS = 'nations';
export const PARAM_UNIT_TAGS = 'unitTags';
export const PARAM_SEARCH_TAGS = 'searchTags';
export const PARAM_PATH = 'path';

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
export const TREE_HOME_PREFIX = 'home';

export const JS_NBSP = '\u00A0';
export const SECONDS_END_MARKER = 'secondsMarker';

export const DEFAULT_COLUMN_WIDTH = 600;

/** Town hall of the stone age, represents the age of players that did not research any age in replays */
export const STONE_AGE_UNIT_ID = 'WarSelection/1/townhall';

export const ENTITY_PICKER_OPTIONS_SIZE = 40;
export const SELECTOR_OPTIONS_SIZE = 20;

export const TICK_RATE = 50;
export const ENGINE_FLOAT_SHIFT = 1000;
export const ENGINE_STORAGE_MULTIPLIER = 100 / 65536;

// ability types
export const ABILITY_TYPE_CREATE_UNIT = 0;
export const ABILITY_TYPE_RESEARCH = 1;
export const ABILITY_TYPE_TRANSFORM = 2;
export const ABILITY_TYPE_CREATE_ENV = 3;
