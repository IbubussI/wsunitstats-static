import * as React from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  type Theme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { EntityPicker } from './EntityPicker';
import { LocaleSelector } from './LocaleSelector';
import { ThemeSelector } from './ThemeSelector';
import { useGameDataStore } from '@/store/gameDataStore';

/** yyyy-MM-dd -> dd.MM.yyyy */
const formatDate = (isoDate: string) => isoDate.split('-').reverse().join('.');

interface Page {
  path: string;
  name: string;
}

export const Header = () => {
  const { t } = useTranslation();
  const gameVersion = useGameDataStore((state) => state.context?.gameVersion);
  const exportDate = useGameDataStore((state) => state.context?.exportDate);

  const pages: Page[] = [
    { path: Constants.UNIT_SELECTOR_PAGE_PATH, name: t('headerUnits') },
    { path: Constants.RESEARCH_SELECTOR_PAGE_PATH, name: t('headerResearches') },
    { path: Constants.MODS_PAGE_PATH, name: t('headerModding') },
    { path: Constants.REPLAY_PAGE_PATH, name: t('headerReplay') },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Stack sx={{
            '& *': {
              display: { xs: 'none', md: 'flex' },
              color: '#ffda6b',
            }
          }}>
            {exportDate && <Typography fontSize='12px' mr={2}>
              {t('headerLastUpdated', { value: formatDate(exportDate) })}
            </Typography>}
            {gameVersion && <Typography fontSize='12px' mr={2}>
              {t('headerGameVersion', { value: `v${gameVersion}` })}
            </Typography>}
          </Stack>
          <NavigationMenu pages={pages} />
          <EntityPicker />
          <SettingsMenu />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const NavigationMenu = ({ pages }: { pages: Page[] }) => {
  const isFullSize = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [anchorElNav, setAnchorElNav] = React.useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchorElNav(null);

  if (isFullSize) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path} style={{ textDecoration: 'none' }}>
            <Button sx={{ my: 2, color: 'white', display: 'block', whiteSpace: 'nowrap' }}>
              {page.name}
            </Button>
          </NavLink>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex' }}>
      <IconButton size="large" onClick={(event) => setAnchorElNav(event.currentTarget)} color="inherit">
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchorElNav}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={Boolean(anchorElNav)}
        onClose={closeMenu}>
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <MenuItem onClick={closeMenu}>
              <Typography textAlign="center">
                {page.name}
              </Typography>
            </MenuItem>
          </NavLink>
        ))}
      </Menu>
    </Box>
  );
};

const SettingsMenu = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton size="large" onClick={(event) => setAnchorEl(event.currentTarget)} color="inherit">
        <SettingsIcon />
      </IconButton>
      <Menu anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            <FormControlLabel
              sx={{ alignItems: 'start', pointerEvents: 'none', py: 1 }}
              labelPlacement='top'
              control={<LocaleSelector sx={{ pointerEvents: 'all' }} />}
              label={t('localeSelectorLabel')}
            />
            <FormControlLabel
              sx={{ alignItems: 'start', pointerEvents: 'none', py: 1 }}
              labelPlacement='top'
              control={<ThemeSelector sx={{ pointerEvents: 'all' }} />}
              label={t('themeSelectorLabel')}
            />
          </FormGroup>
        </FormControl>
      </Menu>
    </>
  );
};
