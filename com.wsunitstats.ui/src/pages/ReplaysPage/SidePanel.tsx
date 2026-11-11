import * as React from 'react';
import {
  Box,
  ButtonBase,
  Chip,
  Collapse,
  Paper,
  Stack,
  Typography,
  type SxProps,
  type Theme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

export interface SidePanelProps {
  icon: React.ReactNode;
  title: string;
  /** Shown as a chip next to the title when above zero */
  count?: number;
  /** Shown inside another container: no own background and padding */
  embedded?: boolean;
  /** The header collapses the list; the state is stored in the browser under this key, open by default */
  collapsible?: boolean;
  storageKey: string;
  sx?: SxProps<Theme>;
  /** Size of the scrolled list */
  listSx?: SxProps<Theme>;
  listRef?: React.RefObject<HTMLDivElement>;
  /** Shown above the list, not scrolled with it (e.g. filters) */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

let scrollbarLayoutWidth: number | undefined;

/**
 * Width the browser scrollbars take in the layout, px: 0 for overlay scrollbars drawn over the content
 * (e.g. Firefox on Windows 11), the scrollbar width for classic ones (e.g. Chrome, Edge)
 */
const getScrollbarLayoutWidth = () => {
  if (scrollbarLayoutWidth === undefined) {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll';
    document.body.appendChild(probe);
    scrollbarLayoutWidth = probe.offsetWidth - probe.clientWidth;
    probe.remove();
  }
  return scrollbarLayoutWidth;
};

const readStoredOpen = (key: string) => {
  try {
    return localStorage.getItem(key) !== 'false';
  } catch {
    return true;
  }
};

const storeOpen = (key: string, isOpen: boolean) => {
  try {
    localStorage.setItem(key, String(isOpen));
  } catch {
    // storage is blocked: the state is kept until the page is reloaded
  }
};

/** Side panel of the replay page: a header with a title and a scrolled list below it */
export const SidePanel = ({
  icon, title, count, embedded = false, collapsible = false, storageKey, sx, listSx, listRef, toolbar, children
}: SidePanelProps) => {
  const { t } = useTranslation();
  const [isStoredOpen, setStoredOpen] = React.useState(() => readStoredOpen(storageKey));
  const isOpen = !collapsible || isStoredOpen;
  const toggle = () => {
    storeOpen(storageKey, !isStoredOpen);
    setStoredOpen(!isStoredOpen);
  };
  const hasOverlayScrollbars = React.useMemo(() => getScrollbarLayoutWidth() === 0, []);

  return (
    <Paper
      elevation={embedded ? 0 : undefined}
      sx={[
        { p: embedded ? 0 : 1.5, display: 'flex', flexDirection: 'column' },
        embedded && { backgroundColor: 'transparent', backgroundImage: 'none' },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}>
      <Stack direction='row' alignItems='center' justifyContent='center' gap={1}
        {...(collapsible && {
          component: ButtonBase,
          onClick: toggle,
          'aria-expanded': isOpen,
          title: t(isOpen ? 'replayHistoryCollapse' : 'replayHistoryExpand')
        })}
        sx={{
          position: 'relative',
          width: '100%',
          py: 0.5,
          borderRadius: 1,
          '&:hover': collapsible ? { backgroundColor: 'action.hover' } : undefined,
          '& > svg:first-of-type': { fontSize: '1.25rem', color: 'primary.main' }
        }}>
        {icon}
        <Typography variant='subtitle2'>
          {title}
        </Typography>
        {!!count &&
          <Chip label={count} size='small' sx={{ height: 18, fontSize: '0.7rem' }} />}
        {collapsible &&
          <ExpandMoreIcon fontSize='small' sx={(theme) => ({
            position: 'absolute',
            right: 4,
            color: 'text.secondary',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: theme.transitions.create('transform')
          })} />}
      </Stack>
      <Collapse in={isOpen}>
        {toolbar && <Box sx={{ mt: 0.5 }}>{toolbar}</Box>}
        <Box ref={listRef} sx={[
          { overflowY: 'auto', pr: 0.5, mt: 0.5, pt: 0.5, borderTop: 1, borderColor: 'divider' },
          // the scrollbar takes most of the panel padding on the right instead of the content width:
          // classic scrollbars get their space reserved (no shift when they appear), overlay ones are drawn
          // over the content, so the list keeps the space for them inside
          !embedded && { mr: -1.25, scrollbarGutter: 'stable', pr: hasOverlayScrollbars ? 1.5 : 0 },
          ...(Array.isArray(listSx) ? listSx : [listSx])
        ]}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};

/** Placeholder of an empty list */
export const SidePanelEmpty = ({ icon, text }: { icon: React.ReactElement<{ sx?: SxProps<Theme> }>; text: string }) => (
  <Stack alignItems='center' gap={1} sx={{ py: 4, color: 'text.secondary', '& > svg': { fontSize: 40, opacity: 0.4 } }}>
    {icon}
    <Typography variant='body2' sx={{ textAlign: 'center' }}>
      {text}
    </Typography>
  </Stack>
);
