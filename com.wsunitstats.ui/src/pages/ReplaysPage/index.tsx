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
  const isWide = useMediaQuery((theme: Theme) =>
    `(min-width:${theme.breakpoints.values.md + 2 * (SIDE_ZONE_SPACING * 2 + SIDE_MIN_WIDTH)}px)`);
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

  const isSuccess = replayInfo?.error === 0;
  const showReplay = isWide || view === 'replay';

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
      sx={isWide
        ? {
          gridColumn: 3,
          justifySelf: 'start',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: SIDE_MAX_WIDTH,
          position: 'sticky',
          top: 32,
          my: 4
        }
        : undefined}
      listSx={isWide
        // the panel grows with the list up to the screen height (minus the page margins and the panel header)
        ? { maxHeight: 'min(calc(100vh - 190px), 540px)' }
        : { height: 'calc(100vh - 300px)', minHeight: 260 }} />
  );

  return (
    // the page root centers its children with their content width: take the screen width, as the replay
    // container did before, so wide content scrolls inside its own scroller instead of widening the page
    // on wide screens the replay stays in the middle column and the history takes the right side zone
    <Box sx={[
      { width: '100%', boxSizing: 'border-box' },
      isWide && {
        display: 'grid',
        gridTemplateColumns: (theme: Theme) => `1fr minmax(0, ${theme.breakpoints.values.md}px) 1fr`,
        alignItems: 'start',
        columnGap: `${SIDE_ZONE_SPACING}px`,
        px: `${SIDE_ZONE_SPACING}px`
      }
    ]}>
      <Container maxWidth="md" component={Paper} sx={{ my: 4, mx: isWide ? 0 : 'auto', p: '24px', minWidth: 0, gridColumn: isWide ? 2 : undefined }}>
        {/* side columns share the free space, so the form stays centered while the menu button fits */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, max-content) 1fr', alignItems: 'center', gap: 1 }}>
          <Box>
            {!isWide && <ReplayViewMenu view={view} onChange={setView} />}
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
        {!showReplay && history}
      </Container>
      {isWide && history}
    </Box>
  );
};

type ReplayPageView = 'replay' | 'history';

/** Width range of the history in the side zone; below the minimum it is switched by the menu instead */
// fits 1366px screens (900 + 2 × (200 + 2 × 16) = 1364)
const SIDE_MIN_WIDTH = 200;
const SIDE_MAX_WIDTH = 480;
/** Gap between the side zone and the replay, and between the side zone and the screen edge, px */
const SIDE_ZONE_SPACING = 16;

/** Switches the window shown on small screens, where the replay and the history do not fit side by side */
const ReplayViewMenu = ({ view, onChange }: { view: ReplayPageView; onChange: (view: ReplayPageView) => void }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const items: { view: ReplayPageView; name: string }[] = [
    { view: 'replay', name: t('replayViewReplay') },
    { view: 'history', name: t('replayHistoryTitle') }
  ];

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
