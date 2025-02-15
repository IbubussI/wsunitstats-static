import * as React from 'react';
import Box from '@mui/material/Box';
import {
  Button,
  ClickAwayListener,
  Paper,
  Popper,
  styled
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { getTagData } from 'data';
import { DoubleColumnTable } from 'components/Layout/DoubleColumnTable';
import { useTranslation } from 'react-i18next';
import { TagChip } from 'components/Atoms/TagChip';

export const ButtonPopper = ({
  children,
  buttonRenderer: ButtonRenderer,
  placement,
  padding = '16px'
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (Boolean(anchorEl)) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [anchorEl]);

  const handleClickAway = () => {
    setOpen(false);
    setAnchorEl(null);
  }

  const handleClick = (event) => {
    setOpen((prev) => !prev);
    setAnchorEl(anchorEl ? null : event.currentTarget);
  }

  return (
    <>
      <ButtonRenderer onClick={handleClick} open={open} />
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        modifiers={[
          {
            name: 'flip',
            enabled: false,
          },
        ]}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper elevation={6}>
            <Box sx={{ p: padding }}>
              {children}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

export const InfoButtonPopper = ({ children, label }) => {
  const ButtonContentRenderer = ({ onClick, open }) => {
    const Icon = open ? ArrowDropUpIcon : ArrowDropDownIcon
    return (
      <Button
        variant='outlined'
        onClick={onClick}
        sx={{
          width: '100%',
          textTransform: 'none',
          padding: '5px 24px',
          '&:hover': { backgroundColor: 'rgb(195, 225, 255)' },
        }}>
        {label}
        <Icon sx={{ position: "absolute", bottom: 5, right: 5 }} />
      </Button>
    );
  }
  return (
    <ButtonPopper
      children={children}
      buttonRenderer={ButtonContentRenderer}
      placement='bottom' />
  );
}

const InteractiveTagChip = styled(TagChip)(() => ({
  '&:hover': {
    backgroundColor: 'rgb(139, 195, 255)'
  },
  '&:hover span': {
    color: 'rgb(1, 113, 212)'
  },
}));

export const PopperTag = ({ tag, placement }) => {
  const { t } = useTranslation();
  const Tag = ({ onClick }) => {
    return (
      <InteractiveTagChip onClick={onClick} label={t(tag.name)}/>
    );
  }

  return (
    <ButtonPopper
      buttonRenderer={Tag}
      placement={placement}
      padding='8px'
    >
      <DoubleColumnTable data={getTagData(tag, t)} />
    </ButtonPopper>
  );
}
