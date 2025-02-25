import * as Utils from 'utils/utils';
import * as Constants from "utils/constants";
import { Avatar, Box, Chip, Link, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { PopperTag } from "components/Atoms/ButtonPopper";
import { useTranslation } from 'react-i18next';

export const Image = React.forwardRef((props, ref) => {
  const {
    height,
    width,
    path,
    isStatic,
    ...other
  } = props;
  return (
    <Box ref={ref}
      {...other}
      component="img"
      height={height}
      width={width}
      alt=''
      loading="lazy"
      src={isStatic ? path : Utils.resolveImage(path)}
    />
  );
});

export const Text = ({ data }) => {
  return (
    <Typography variant='body2' color='text.primary'>
      {data}
    </Typography>
  );
};

export const SubValue = ({ data }) => {
  let subString = '';
  data.subValues.forEach((entry, index) => {
    let delimiter = data.subValues[index + 1] && typeof data.subValues[index + 1].value === 'number' ? ', ' : '';
    if (entry.value) {
      if (entry.label) {
        subString = subString.concat(`${entry.label}:${Constants.JS_NBSP}${entry.value}${delimiter}`);
      } else {
        subString = subString.concat(`${entry.value}${delimiter}`);
      }
    }
  });
  return (
    <>
      <Typography variant='body2' color='text.primary' lineHeight={1.2}>
        {data.primaryValue}
      </Typography>
      <Typography variant='caption' color='text.secondary' lineHeight={1.2}>
        {subString}
      </Typography>
    </>
  );
};

export const TagList = ({ data }) => {
  return (
    <>
      {data.tags && data.tags.map((tag, index) => (
        <Box key={index} sx={{ paddingBottom: '2px' }}>
          <PopperTag key={index} tag={tag} placement='right' />
        </Box>
      ))}
    </>
  );
};

export const Resource = ({ data }) => {
  return (
    <Stack
      direction='row'
      spacing={0.7}
      sx={{
        width: 'fit-content',
        margin: '5px',
        marginLeft: '0'
      }}>
      {data.map((resource, index) =>
        <Tooltip key={index} title={resource.resourceName}>
          <Stack direction='column' alignItems='center' sx={{ minWidth: '50px' }}>
            <Image path={resource.image}
              width={25}
              height={25} />
            <Typography variant='body2' color='text.primary'>
              {resource.value}
            </Typography>
          </Stack>
        </Tooltip>
      )}
    </Stack>
  );
};

export const EntityInfo = (props) => {
  const {
    data,
    clearLinkStyle,
    ...forwardedProps
  } = props;
  const { locale } = useParams();
  const minWidth = data.overflow ? '0' : '';
  const availableLines = data.secondary ? 1 : 2;
  const overflow = data.overflow ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: availableLines,
    WebkitBoxOrient: 'vertical',
  } : {};

  const LinkContent = () => {
    return (
      <Stack direction='row' alignItems='center'>
        <Stack sx={{ marginRight: 0.4, height: 'fit-content' }}>
          <Image path={data.image.path}
            width={data.image.width}
            height={data.image.height} />
        </Stack>
        <Stack minWidth={minWidth}>
          <Typography variant={'body2'} lineHeight={1.2} sx={overflow}>
            {data.primary}
          </Typography>
          {data.secondary && <Typography variant={'caption'} lineHeight={1.2}>
            {data.secondary}
          </Typography>}
        </Stack>
      </Stack>
    );
  }

  return (
    <Box {...forwardedProps}>
      {data?.link.path === Constants.NO_LINK_INDICATOR ?
        <DisabledLink>
          <LinkContent />
        </DisabledLink>
        :
        <Link to={Utils.makeEntityLink(locale, data.link)} component={RouterLink}
          sx={{ textDecoration: clearLinkStyle ? 'none' : undefined,  }}>
          <LinkContent />
        </Link>}
    </Box>
  );
};

export const HeaderChip = ({ data }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const color = data.disabled ? 'error.main' : 'text.secondary';
  const textColor = data.disabled ? 'error.main' : 'text.primary';
  const borderColor = data.disabled ? 'error.main' : 'primary.dark';
  const isLabel = data.label || (data.disabledLabel && data.disabled);
  return (
    <Box sx={{
      border: '1px solid',
      borderColor: borderColor,
      color: color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      height: '32px',
      backgroundColor: theme.palette.background.paper,
    }}>
      <Tooltip title={data.tooltip}>
        <Avatar sx={{
          fontWeight: 'inherit',
          border: '1px solid',
          width: '24px',
          height: '24px',
          fontSize: '0.75rem',
          color: color,
          marginLeft: isLabel ? '4px' : '3px',
          marginRight: isLabel ? '-6px' : '3px'
        }}>
          {data.id}
        </Avatar>
      </Tooltip>
      {isLabel && <Stack alignItems='center' sx={{
        paddingRight: '12px',
        paddingLeft: '12px',
      }}>
        {data.label &&
          <Typography
            variant='body2'
            sx={{
              fontWeight: 'inherit',
              fontSize: data.disabled ? 12 : 14,
              lineHeight: 1.1,
              color: textColor,
              paddingBottom: data.disabled ? '1px' : '',
              marginTop: data.disabled ? '-3px' : ''
            }}>
            {data.label}
          </Typography>}
        {data.disabled &&
          <Chip
            label={t('disabledHeaderChip')}
            variant='contained'
            color='error'
            sx={{
              textTransform: 'uppercase',
              fontSize: '11px',
              height: '13px',
              minwidth: 'fit-content',
              '& > .MuiChip-label': {
                padding: '4px'
              }
            }} />}
      </Stack>}
    </Box>
  );
};

const DisabledLink = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};
