import * as Utils from 'utils/utils';
import * as Constants from "utils/constants";
import { Avatar, Box, Chip, Link, Stack, Tooltip, Typography } from "@mui/material";
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { PopperTag } from "components/Atoms/ButtonPopper";

export const Image = ({ data }) => {
  return (
    <Box
      component="img"
      sx={{
        height: data.height,
        width: data.width,
      }}
      alt=''
      src={Utils.resolveImage(data.path)}
    />
  );
}

export const Text = ({ data }) => {
  return (
    <Typography variant='body2' color='text.primary'>
      {data}
    </Typography>
  );
}

export const ButtonText = ({ data }) => {
  return (
    <Typography variant='body2' color='rgb(25, 118, 210)'>
      {data}
    </Typography>
  );
}

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
}

export const TagList = ({ data }) => {
  return (
    <>
      {data.tags && data.tags.map((tag, index) => (
        <Box key={index} sx={{ paddingBottom: '2px' }}>
          <PopperTag key={index} tag={tag} placement='right'/>
        </Box>
      ))}
    </>
  );
}

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
            <Image data={{
              path: resource.image,
              width: 25,
              height: 25,
            }} />
            <Typography variant='body2' color='text.primary'>
              {resource.value}
            </Typography>
          </Stack>
        </Tooltip>
      )}
    </Stack>
  );
}

export const EntityInfo = (props) => {
  const data = props.data;
  const Entry = ({ entryData }) => {
    const minWidth = entryData.overflow ? '0' : '';
    const availableLines = entryData.secondary ? 1 : 2;
    const overflow = entryData.overflow ? {
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
            <Image data={entryData.image} />
          </Stack>
          <Stack minWidth={minWidth}>
            <Typography variant={'body2'} lineHeight={1.2} sx={overflow}>
              {entryData.primary}
            </Typography>
            {entryData.secondary && <Typography variant={'caption'} lineHeight={1.2}>
              {entryData.secondary}
            </Typography>}
          </Stack>
        </Stack>
      );
    }

    return (
      <Box {...props}>
        {entryData?.link.path === Constants.NO_LINK_INDICATOR ?
          <DisabledLink>
            <LinkContent />
          </DisabledLink>
          :
          <Link to={Utils.makeEntityLink(entryData.link)} component={RouterLink}>
            <LinkContent />
          </Link>}
      </Box>
    );
  }

  const direction = data.direction ? data.direction : 'row';
  return (
    <Stack direction={direction} gap={1}>
      {data.values.map((entry, index) => <Entry key={index} entryData={entry} />)}
    </Stack>
  );
}

export const TransformInfo = ({ data }) => {
  const From = data.fromRenderer;
  const To = data.toRenderer;
  return (
    <Stack direction='row' sx={{
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      padding: '10px',

    }}>
      <Box sx={{ flexGrow: 1, flexBasis: 0 }} >
        <Box sx={{
          maxWidth: 'max-content',
          margin: 'auto'
        }}>
          <From data={data.from} />
        </Box>
      </Box>
      <Box sx={{
        fontSize: '40px',
        lineHeight: '40px',
        color: 'rgb(22, 124, 232)'
      }}>
        <i className="fa-solid fa-right-long"></i>
      </Box>
      <Box sx={{ flexGrow: 1, flexBasis: 0 }} >
        <Box sx={{
          maxWidth: 'max-content',
          margin: 'auto'
        }}>
          <To data={data.to} />
        </Box>
      </Box>
    </Stack>
  );
}

export const HeaderChip = ({ data }) => {
  const color = data.disabled ? 'error.main' : 'text.secondary';
  const textColor = data.disabled ? 'error.main' : 'text.primary';
  const borderColor = data.disabled ? 'error.main' : 'rgb(85, 120, 218)';
  const isLabel = data.label || (data.disabledLabel && data.disabled);
  return (
    <Box sx={{
      border: '3px solid',
      borderColor: borderColor,
      color: color,
      borderRadius: '18px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      height: '32px',
      backgroundColor: 'white',

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
        <Typography
          variant='body2'
          sx={{
            fontWeight: 'inherit',
            fontSize: 14,
            lineHeight: 'initial',
            color: textColor,
            paddingBottom: data.disabled ? '1px' : '',
            marginTop: data.disabled ? '-3px' : ''
          }}>
          {data.label}
        </Typography>
        {data.disabled &&
          <Chip
            label='disabled'
            variant='contained'
            color='error'
            sx={{
              textTransform: 'uppercase',
              fontSize: '11px',
              height: '14px',
              minwidth: 'fit-content',
              '& > .MuiChip-label': {
                padding: '4px'
              }
            }} />}
      </Stack>}
    </Box>
  );
}

const DisabledLink = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
}