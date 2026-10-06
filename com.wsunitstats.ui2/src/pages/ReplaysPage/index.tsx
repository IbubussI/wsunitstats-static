import * as React from 'react';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import {
  Box,
  Container,
  Paper,
  styled,
  TextField,
  useTheme
} from '@mui/material';
import { FormButton } from '@/components/common/misc';
import { ReplayInfoParser } from '@/pages/ReplaysPage/ReplayInfo/replayInfoParser';
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '@/store/gameDataStore';
import { loadLegacyUnitIds } from '@/pages/ReplaysPage/ReplayInfo/legacyUnitIds';
import type { ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

const FormContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 0.5,
  width: '100%',
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
  const isDebug = searchParams.get('debug') || false;

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
          setReplayInfo(parser.parse(responseJson));
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
  }, [params.replayCode, gameContext, isDebug]);

  const isSuccess = replayInfo?.error === 0;
  return (
    <Container maxWidth="md" component={Paper} sx={{ my: 4, p: '24px' }}>
      <ReplayForm
        onSubmit={(event: React.FormEvent) => {
          // prevent page reload
          event.preventDefault();
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

      {isSuccess
        ? <Outlet context={replayInfo} />
        : <ErrorViewer errorData={replayInfo} />}
    </Container>
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
        label={t('replayFormLabel')}
        variant="standard"
        value={inputValue}
        onChange={onInputChange} />
      <FormButton type='submit' loading={isLoading}>
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
