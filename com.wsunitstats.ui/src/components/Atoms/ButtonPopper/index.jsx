import * as React from 'react';
import Box from '@mui/material/Box';
import {
  Button,
  Chip,
  ClickAwayListener,
  Paper,
  Popper,
  styled
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { getTagData } from 'data';
import { DoubleColumnTable } from 'components/Layout/DoubleColumnTable';

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

export const MenuListButtonPopper = ({ children, label }) => {
  const ButtonContentRenderer = ({ onClick, open }) => {
    const Icon = open ? ArrowDropUpIcon : ArrowDropDownIcon
    return (
      <Button
        variant='outlined'
        onClick={onClick}
        sx={{
          width: '100%',
          height: '100%',
          textTransform: 'none',
          padding: '5px 24px',
          borderColor: 'rgb(203, 203, 203)',
          color: 'rgba(0, 0, 0, 0.87)',
          '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)', backgroundColor: 'initial' },
        }}>
        {label}
        <Icon sx={{ color: 'rgb(117, 117, 117)', position: "absolute", right: '9px', top: 'calc(50% - 12px)' }} />
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

const TagChip = styled(Chip)(() => ({
  borderRadius: '1000px', // to match any height
  height: 'fit-content',
  backgroundColor: 'rgb(24, 117, 238)',
  textTransform: 'uppercase',
  color: 'white',
  '& span': {
    fontWeight: 'bold',
    fontSize: 11,
    whiteSpace: 'normal',
    textAlign: 'center',
    paddingTop: '4px',
    paddingBottom: '4px',
  },
  '&:hover': {
    backgroundColor: 'rgb(139, 195, 255)'
  },
  '&:hover span': {
    color: 'rgb(1, 113, 212)'
  },
}));

export const PopperTag = ({ tag, placement }) => {
  const Tag = ({ onClick }) => {
    return (
      <TagChip onClick={onClick} label={tag.name}/>
    );
  }

  return (
    <ButtonPopper
      buttonRenderer={Tag}
      placement={placement}
      padding='8px'
    >
      <DoubleColumnTable data={getTagData(tag)} />
    </ButtonPopper>
  );
}