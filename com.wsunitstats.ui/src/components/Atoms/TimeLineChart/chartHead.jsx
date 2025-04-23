import {
  alpha,
  Button,
  IconButton,
  Slider,
  Stack,
  styled,
  ToggleButton,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { TooltipIcon } from 'components/Pages/ReplaysPage/ReplayInfo/svg';
import { useTranslation } from "react-i18next";

const ChartButton = styled(Button)({
  fontSize: '0.6rem',
  lineHeight: 1,
  paddingTop: 4,
  paddingBottom: 4,
  padding: '1px',
  minWidth: 0
});

const ChartToggle = styled(ToggleButton)(({ theme, selected }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.6rem',
  lineHeight: 1,
  paddingTop: 4,
  paddingBottom: 4,
  borderColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.5),
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  padding: '1px',
  minWidth: 0
}));

const ChartSlider = styled(Slider)({
  fontSize: '0.6rem',
  lineHeight: 1,
  paddingTop: 4,
  paddingBottom: 4
});

export const ChartHead = (props) => {
  const {
    isSmoothOn = true,
    isToggleTooltipOn = true,
    isZoomOn = true,
    isModalOn = true,
    title,
    infoText,
    chartState: {
      cursorMode,
      updateCursorMode,
      zoomOut,
      zoomInButtonId,
      smooth,
      tooltipOn,
      setTooltipOn
    },
    modalState: {
      isModalOpen,
      openModal,
      closeModal
    },
    children
  } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
      {/* title */}
      <Stack direction="row" gap={0.4} sx={{ flexGrow: 1, alignItems: 'center' }}>
        <Typography variant="body1">
          {title}
        </Typography>
        {infoText && <InfoTextHelper text={infoText} />}
      </Stack>

      {/* control panel */}
      <Stack direction="row" gap={0.6} sx={{ justifyContent: 'right', alignItems: 'center' }}>
        {/* custom children */}
        {children}

        {/* smooth level */}
        {isSmoothOn && <Stack gap={0.4} sx={{ alignItems: 'center', px: 1 }}>
          <Typography variant="caption" sx={{ lineHeight: 0.9 }}>
            {t('chartSmoothness')}
          </Typography>
          <ChartSlider
            sx={{ width: 80 }}
            size="small"
            value={smooth.level}
            onChange={(_, newValue) => smooth.setLevel(newValue)}
            min={smooth.min}
            max={smooth.max}
            valueLabelDisplay="auto"
          />
        </Stack>}

        {/* toggle tooltip */}
        {isToggleTooltipOn && <Tooltip arrow title={t('chartToggleTooltip')}>
          <ChartToggle
            value="toggle-tooltip"
            selected={tooltipOn}
            onClick={() => setTooltipOn(!tooltipOn)}>
            <TooltipIcon color={theme.palette.primary.main} sx={{ width: 20, height: 20 }} />
          </ChartToggle>
        </Tooltip>}

        {/* zoom in */}
        {isZoomOn && <Tooltip arrow title={t('chartZoomIn')}>
          <ChartToggle
            id={zoomInButtonId}
            value="zoom-in-mode"
            selected={cursorMode === 'zoom-in'}
            onClick={() => updateCursorMode('zoom-in', 'zoom-in')}>
            <ZoomInIcon color="primary" fontSize="small" />
          </ChartToggle>
        </Tooltip>}

        {/* zoom out */}
        {isZoomOn && <Tooltip arrow title={t('chartZoomOut')}>
          <ChartButton
            variant="outlined"
            onClick={() => zoomOut()}>
            <ZoomOutIcon color="primary" fontSize="small" />
          </ChartButton>
        </Tooltip>}

        {/* open/close in modal */}
        {isModalOn && <Tooltip arrow title={isModalOpen ? t('chartMinimize') : t('chartMaximize')}>
          <ChartButton onClick={() => isModalOpen ? closeModal() : openModal()} variant="outlined">
            {isModalOpen ? <ZoomInMapIcon fontSize="small" /> : <ZoomOutMapIcon fontSize="small" />}
          </ChartButton>
        </Tooltip>}
      </Stack>
    </Stack>
  );
};

const InfoTextHelper = ({ text }) => {
  return (
    <Tooltip arrow title={text}>
      <IconButton sx={{ p: 0, color: 'primary.main', maxHeight: '1em' }} disableTouchRipple>
        <HelpOutlineIcon />
      </IconButton>
    </Tooltip>
  );
};