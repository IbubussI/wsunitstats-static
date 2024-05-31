import { Box, Stack } from "@mui/material";

const BORDER = '3px solid';
const BORDER_ENABLED = 'rgb(85, 120, 218)';
const BORDER_DISABLED = 'error.main';
const BORDER_RADIUS = 2;

export const DoubleColumnFrame = ({ children, childrenProps, column, borderLabel, disabled }) => {
  const isArray = Array.isArray(children);
  let childrenFiltered = children;
  if (isArray) {
    childrenFiltered = children.filter(element => element);
    if (childrenFiltered.length === 0) {
      return null;
    }
    if (childrenFiltered.length === 1) {
      childrenFiltered = childrenFiltered[0];
    }
  }
  const isSingle = !Array.isArray(childrenFiltered);
  const isBorderLabel = !!borderLabel;

  const direction = column ? 'column' : 'row';
  const borderColor = disabled ? BORDER_DISABLED : BORDER_ENABLED;

  const BorderLabel = ({ data }) => {
    const IDRenderer = data.valueRenderer;
    return (
      <Box sx={{
        position: 'absolute',
        top: '-19px',
        left: borderLabel.shift,
        transform: 'translateX(-50%)'
      }}>
        <IDRenderer data={data.value} />
      </Box>
    );
  }

  const SingleChildRenderer = () => {
    const childProps = {
      padding: '4px',
      boxSizing: 'border-box',
      ...childrenProps[0]
    }
    return (
      <Stack sx={{
        border: BORDER,
        borderColor: borderColor,
        borderRadius: BORDER_RADIUS,
        position: 'relative',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {isBorderLabel && <BorderLabel data={borderLabel}/>}
        <Box sx={childProps}>
          {childrenFiltered}
        </Box>
      </Stack>
    );
  }
  
  const ArrayChildRenderer = () => {
    const isRow = direction === 'row';
    return (
      <Stack sx={{
        flexDirection: direction,
        border: BORDER,
        borderColor: borderColor,
        borderRadius: BORDER_RADIUS,
        position: 'relative',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {isBorderLabel && <BorderLabel data={borderLabel}/>}
        {childrenFiltered.map((child, index) => {
          const isNotLast = index + 1 < childrenFiltered.length;
          const rowBorder = isRow && isNotLast ? BORDER : '';
          const columnBorder = !isRow && isNotLast ? BORDER : '';
  
          const childProps = {
            padding: '4px',
            boxSizing: 'border-box',
            borderRight: rowBorder,
            borderBottom: columnBorder,
            borderColor: borderColor,
            ...childrenProps[index]
          }
          return (
            <Box key={index} sx={childProps}>
              {child}
            </Box>
          );
        })}
      </Stack>
    );
  }

  return (
    <>
      {isSingle
        ? <SingleChildRenderer />
        : <ArrayChildRenderer direction={direction}/>}
    </>
  );
}

