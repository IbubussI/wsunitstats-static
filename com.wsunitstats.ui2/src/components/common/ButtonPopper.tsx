import * as React from 'react';
import {
  Box,
  Button,
  ClickAwayListener,
  Paper,
  Popper,
  type PopperPlacementType
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useTranslation } from 'react-i18next';
import { TagChip } from '@/components/common/TagChip';
import { KeyValueTable } from '@/components/layout/KeyValueTable';
import type { Tag } from '@/types/game';

interface ButtonPopperProps {
  children: React.ReactNode;
  renderButton: (onClick: (event: React.MouseEvent<HTMLElement>) => void, open: boolean) => React.ReactNode;
  placement: PopperPlacementType;
  padding?: string;
}

/** Button that shows its children in a popper on click */
export const ButtonPopper = ({ children, renderButton, placement, padding = '16px' }: ButtonPopperProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      {renderButton((event) => setAnchorEl(anchorEl ? null : event.currentTarget), open)}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        // above positioned page elements like frame labels
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
        modifiers={[{ name: 'flip', enabled: false }]}>
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper elevation={6}>
            <Box sx={{ p: padding }}>
              {children}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

/** Full width outlined button with a popper */
export const InfoButtonPopper = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <ButtonPopper
    placement='bottom'
    renderButton={(onClick, open) => {
      const Icon = open ? ArrowDropUpIcon : ArrowDropDownIcon;
      return (
        <Button
          variant='outlined'
          onClick={onClick}
          sx={{
            width: '100%',
            textTransform: 'none',
            padding: '5px 24px'
          }}>
          {label}
          <Icon sx={{ position: 'absolute', bottom: 5, right: 5 }} />
        </Button>
      );
    }}>
    {children}
  </ButtonPopper>
);

/** Tag chip that shows tag details on click */
export const PopperTag = ({ tag, placement }: { tag: Tag; placement: PopperPlacementType }) => {
  const { t } = useTranslation();
  return (
    <ButtonPopper
      placement={placement}
      padding='8px'
      renderButton={(onClick) => <TagChip onClick={onClick} label={t(tag.name)} color='primary' />}>
      <KeyValueTable
        tableLayout='fixed'
        firstRowPaddingTop='4px'
        rows={[
          { label: t('tagNameCell'), value: t(tag.name) },
          { label: t('tagGroupCell'), value: t(tag.groupName) },
          { label: t('tagIdCell'), value: tag.gameId }
        ]} />
    </ButtonPopper>
  );
};
