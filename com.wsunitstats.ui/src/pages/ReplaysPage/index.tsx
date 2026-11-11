import * as React from 'react';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import {
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  styled,
  TextField,
  useMediaQuery,
  useTheme,
  type Theme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { FormButton } from '@/components/common/misc';
import { ReplayInfoParser } from '@/pages/ReplaysPage/ReplayInfo/replayInfoParser';
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '@/store/gameDataStore';
import { loadLegacyUnitIds } from '@/pages/ReplaysPage/ReplayInfo/legacyUnitIds';
import type { ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import { ReplayHistory } from '@/pages/ReplaysPage/ReplayHistory';
import { useReplayHistoryStore } from '@/store/replayHistoryStore';
import { loadReplayExtraData, type ReplayExtraData } from '@/pages/ReplaysPage/ReplayInfo/replayAnalyzer';
import { ReplayEvents } from '@/pages/ReplaysPage/ReplayEvents';

const FormContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 0.5,
  minWidth: 0,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  justifyContent: 'center'
}));

export const ReplayPage = () => {
  const gameContext = useGameContext();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [replayCodeInput, setReplayCodeInput] = React.useState('');
  const [replayInfo, setReplayInfo] = React.useState<ReplayParseResult | { error: number; message: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const isDebug = searchParams.get('debug') || false;  const addReplayToHistory = useReplayHistoryStore(state => state.addReplay);
  // on small screens only one window is shown, switched by the menu
  const isWide = useMediaQuery(`(min-width:${REPLAY_MIN_WIDTH + 2 * (SIDE_ZONE_SPACING * 2 + SIDE_MIN_WIDTH)}px)`);
  const [view, setView] = React.useState<ReplayPageView>('replay');

  const openReplay = (replayCode: string) => {
    navigate(Utils.getUrlWithPathParams([
      { param: replayCode, pos: 3 },
      { param: Constants.REPLAY_INFO_PAGE_PATH, pos: 4 }
    ], false, 5), { replace: false });
  };

  const clear = () => {
    navigate(Utils.getUrlWithPathParams([], false, 3), { replace: true });
  };

  React.useEffect(() => {
    const replayCodeParam = params.replayCode;
    const replayCode = parseReplayCode(replayCodeParam);
    if (replayCode) {
      setReplayCodeInput(replayCode);
      setIsLoading(true);
      Utils.fetchJson(Constants.WS_GAMES_API_REPLAY_BY_CODE + replayCode,
        async (responseJson: any) => {
          // replays recorded before the game switched to path ids have no unit id mapping (extraData 7)
          const isLegacy = responseJson.error === 0 && responseJson.data?.extraData?.['7'] == null;
          const legacyUnitIds = isLegacy ? await loadLegacyUnitIds() : undefined;
          const parser = new ReplayInfoParser(gameContext, replayCode, isDebug, legacyUnitIds);
          const parseResult = parser.parse(responseJson);
          if (parseResult.error === 0) {
            addReplayToHistory(parseResult.match);
          }
          setReplayInfo(parseResult);
          setIsLoading(false);
        },
        (errorResponse) => {
          setReplayInfo({ error: 255, message: errorResponse.message ? errorResponse.message : errorResponse });
          setIsLoading(false);
        }
      );
    } else if (replayCodeParam) {
      setReplayInfo({ error: 255, message: "Submitted replay code is not valid." });
    }
  }, [params.replayCode, gameContext, isDebug, addReplayToHistory]);

  // optional: the panels are shown only if the data is loaded, failures are ignored
  const [extraData, setExtraData] = React.useState<{ replayCode: string; data: ReplayExtraData } | null>(null);
  React.useEffect(() => {
    const replayCode = parseReplayCode(params.replayCode);
    if (!replayCode) {
      return;
    }
    let isActual = true;
    loadReplayExtraData(replayCode).then(data => {
      if (isActual && data) {
        setExtraData({ replayCode, data });
      }
    });
    return () => {
      isActual = false;
    };
  }, [params.replayCode]);

  const isSuccess = replayInfo?.error === 0;
  const parsedReplay = isSuccess ? replayInfo as ReplayParseResult : null;
  // both parts must be of the same replay: either can still be loading for the previous one
  const replayExtraData = extraData && extraData.replayCode === parsedReplay?.match.replayCode ? extraData.data : null;
  const views: ReplayPageView[] = replayExtraData ? ['replay', 'events', 'history'] : ['replay', 'history'];
  const activeView = views.includes(view) ? view : 'replay';
  const showReplay = isWide || activeView === 'replay';

  // side panels grow with the list up to a part of the screen height, so they always fit the screen and never
  // make the page longer; on small screens the panel fills the window below the form
  const sidePanelListSx = isWide
    ? { maxHeight: `${SIDE_PANEL_LIST_MAX_HEIGHT_VH}vh` }
    : { height: 'calc(100vh - 300px)', minHeight: 260 };
  const sidePanelSx = (side: 'left' | 'right') => isWide
    ? {
      gridColumn: side === 'left' ? 1 : 3,
      gridRow: 1,
      justifySelf: side === 'left' ? 'end' : 'start',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: SIDE_MAX_WIDTH,
      position: 'sticky',
      top: SIDE_PANEL_MARGIN,
      my: `${SIDE_PANEL_MARGIN}px`
    } as const
    : undefined;

  const events = parsedReplay && replayExtraData &&
    <ReplayEvents
      replayInfo={parsedReplay}
      extraData={replayExtraData}
      embedded={!isWide}
      collapsible={isWide}
      sx={sidePanelSx('left')}
      listSx={sidePanelListSx} />;

  const history = (
    <ReplayHistory
      currentReplayCode={parseReplayCode(params.replayCode)}
      onOpen={(replayCode) => {
        setReplayCodeInput(replayCode);
        setView('replay');
        openReplay(replayCode);
      }}
      embedded={!isWide}
      // the side panel collapses to its header; on small screens the window is chosen by the menu instead
      collapsible={isWide}
      sx={sidePanelSx('right')}
      listSx={sidePanelListSx} />
  );

  return (
    // the page root centers its children with their content width: take the screen width, as the replay
    // container did before, so wide content scrolls inside its own scroller instead of widening the page
    // on wide screens the replay stays in the middle column, the history takes the right side zone
    // and the replay events the left one. The replay takes its full width only if the side zones keep
    // their minimum width, otherwise it shrinks first (its wide content scrolls)
    <Box sx={[
      { width: '100%', boxSizing: 'border-box' },
      isWide && {
        display: 'grid',
        gridTemplateColumns: (theme: Theme) =>
          `minmax(${SIDE_MIN_WIDTH}px, 1fr) minmax(0, ${theme.breakpoints.values.md}px) minmax(${SIDE_MIN_WIDTH}px, 1fr)`,
        alignItems: 'start',
        columnGap: `${SIDE_ZONE_SPACING}px`,
        px: `${SIDE_ZONE_SPACING}px`
      }
    ]}>
      <Container maxWidth="md" component={Paper} sx={{ my: 4, mx: isWide ? 0 : 'auto', p: '24px', minWidth: 0, gridColumn: isWide ? 2 : undefined }}>
        {/* side columns share the free space, so the form stays centered while the menu button fits */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, max-content) 1fr', alignItems: 'center', gap: 1 }}>
          <Box>
            {!isWide && <ReplayViewMenu views={views} view={activeView} onChange={setView} />}
          </Box>
          <ReplayForm
            onSubmit={(event: React.FormEvent) => {
              // prevent page reload
              event.preventDefault();
              setView('replay');
              const replayCode = parseReplayCode(replayCodeInput.trim());
              if (replayCode) {
                setReplayCodeInput(replayCode);
                openReplay(replayCode);
              } else if (replayCodeInput) {
                setReplayInfo({ error: 255, message: "Submitted replay code is not valid." });
                clear();
              }
            }}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => setReplayCodeInput(event.target.value)}
            inputValue={replayCodeInput}
            isLoading={isLoading} />
        </Box>

        {/* hidden instead of unmounted, so the replay view keeps its state while the history is open */}
        <Box sx={{ display: showReplay ? 'block' : 'none' }}>
          {isSuccess
            ? <Outlet context={replayInfo} />
            : <ErrorViewer errorData={replayInfo} />}
        </Box>
        {!showReplay && (activeView === 'events' ? events : history)}
      </Container>
      {isWide && history}
      {isWide && events}
    </Box>
  );
};

type ReplayPageView = 'replay' | 'events' | 'history';

const VIEW_NAMES: Record<ReplayPageView, string> = {
  replay: 'replayViewReplay',
  events: 'replayEventsTitle',
  history: 'replayHistoryTitle'
};

/** Width range of the side panels; below the minimum the replay shrinks */
const SIDE_MIN_WIDTH = 300;
const SIDE_MAX_WIDTH = 480;
/**
 * Narrowest replay next to the side panels; below it one window is shown, switched by the menu.
 * Fits 1366px screens (700 + 2 × (300 + 2 × 16) = 1364)
 */
const REPLAY_MIN_WIDTH = 700;
/** Gap between the side zone and the replay, and between the side zone and the screen edge, px */
const SIDE_ZONE_SPACING = 16;
/** Space above and below the side panels, and between a sticky panel and the top of the screen, px */
const SIDE_PANEL_MARGIN = 32;
/** Max height of a side panel list, % of the screen height (the panel header and margins take the rest) */
const SIDE_PANEL_LIST_MAX_HEIGHT_VH = 70;

/** Switches the window shown on small screens, where the replay and the history do not fit side by side */
const ReplayViewMenu = ({ views, view, onChange }: {
  views: ReplayPageView[];
  view: ReplayPageView;
  onChange: (view: ReplayPageView) => void
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const items = views.map(view => ({ view, name: t(VIEW_NAMES[view]) }));

  return (
    <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} color="inherit">
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}>
        {items.map(item => (
          <MenuItem key={item.view}
            selected={item.view === view}
            onClick={() => {
              onChange(item.view);
              setAnchorEl(null);
            }}>
            {item.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

interface ReplayFormProps {
  onSubmit: (event: React.FormEvent) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputValue: string;
  isLoading: boolean;
}

const ReplayForm = ({ onSubmit, onInputChange, inputValue, isLoading }: ReplayFormProps) => {
  const { t } = useTranslation();
  return (
    <FormContainer onSubmit={onSubmit}>
      <TextField
        sx={{ flex: '0 1 auto', minWidth: 0 }}
        label={t('replayFormLabel')}
        variant="standard"
        value={inputValue}
        onChange={onInputChange} />
      <FormButton type='submit' loading={isLoading} sx={{ flex: '0 0 auto' }}>
        {t('replayFormLoad')}
      </FormButton>
    </FormContainer>
  );
};

const ErrorViewer = ({ errorData }: { errorData: { message?: string } | null }) => {
  const theme = useTheme();

  if (errorData) {
    return (
      <Box sx={{
        textAlign: 'center',
        color: theme.palette.error.main,
        wordWrap: "break-word"
      }}>
        {errorData.message}
      </Box>
    );
  } else {
    return null;
  }
};

function parseReplayCode(input?: string) {
  if (!input) {
    return;
  }

  const regexp = /^(?:rep-)?(.{11})$/;
  const match = input.match(regexp);
  return match ? match[1] : undefined;
}
