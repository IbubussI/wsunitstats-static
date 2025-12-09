import * as React from 'react';
import * as Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavLink, useNavigate } from 'react-router-dom';
import { EntityPicker } from 'components/Header/EntityPicker';
import { FormControl, FormControlLabel, FormGroup, Stack, useMediaQuery } from '@mui/material';
import { LocaleSelector } from './LocaleSelector';
import { useTranslation } from 'react-i18next';
import { ThemeSelector } from './ThemeSelector';
import { GameDataContext } from 'gameDataContext';
import { useContext } from 'react';

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const pages = [
    {
      path: Constants.UNIT_SELECTOR_PAGE_PATH,
      name: t('headerUnits')
    },
    {
      path: Constants.RESEARCH_SELECTOR_PAGE_PATH,
      name: t('headerResearches')
    },
    {
      path: Constants.MODS_PAGE_PATH,
      name: t('headerModding')
    },
    {
      path: Constants.REPLAY_PAGE_PATH,
      name: t('headerReplay')
    },
  ];

  const onEntityChange = (newRoute, newGameId) => {
    if (newGameId !== null) {
      // don't keep search params here as we are navigating to another unit page
      navigate(Utils.getUrlWithPathParams([{ param: newRoute, pos: 2 }, { param: newGameId, pos: 3 }, { param: Constants.INITIAL_TAB, pos: 4 }], false));
    }
  };

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
            <Typography fontSize='12px' mr={2}>
              {t('headerLastUpdated', { value: '02.12.2025' })}
            </Typography>
            <Typography fontSize='12px' mr={2}>
              {t('headerGameVersion', { value: 'v193.3693_28985' })}
            </Typography>
          </Stack>
          <NavigationMenu pages={pages} />
          <EntityPicker onSelect={onEntityChange} />
          <SettingsMenu />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const NavigationMenu = ({ pages }) => {
  const isFullSize = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      {!isFullSize &&
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <IconButton size="large"
            onClick={handleOpenNavMenu}
            color="inherit">
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}>
            {pages.map((page) => (
              <NavLink key={page.path} to={page.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">
                    {page.name}
                  </Typography>
                </MenuItem>
              </NavLink>
            ))}
          </Menu>
        </Box>}
      {isFullSize && <Box sx={{ flexGrow: 1, display: 'flex' }}>
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path} style={{ textDecoration: 'none' }}>
            <Button onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block', whiteSpace: 'nowrap' }}>
              {page.name}
            </Button>
          </NavLink>
        ))}
      </Box>}
    </>
  );
};

const SettingsMenu = () => {
  const { t } = useTranslation();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const gameContext = useContext(GameDataContext);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      <IconButton
        size="large"
        onClick={handleOpenNavMenu}
        color="inherit">
        <SettingsIcon />
      </IconButton>
      <Menu anchorEl={anchorElNav}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
              <FormControlLabel
                sx={{ alignItems: 'start', pointerEvents: 'none', py: 1 }}
                labelPlacement='top'
                control={
                  <LocaleSelector sx={{ pointerEvents: 'all' }} options={gameContext.localeOptions} />
                }
                label={t('localeSelectorLabel')}
              />
              <FormControlLabel
                sx={{ alignItems: 'start', pointerEvents: 'none', py: 1 }}
                labelPlacement='top'
                control={
                  <ThemeSelector sx={{ pointerEvents: 'all' }}/>
                }
                label={t('themeSelectorLabel')}
              />
            </FormGroup>
        </FormControl>
      </Menu>
    </>
  );
};
