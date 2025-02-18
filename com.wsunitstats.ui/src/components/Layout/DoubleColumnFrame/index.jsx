import { Box, Stack } from "@mui/material";

const BORDER = '1px solid';
const BORDER_ENABLED = 'primary.dark';
const BORDER_DISABLED = 'error.main';
const BORDER_RADIUS = 0;

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

  return (
    <>
      {isSingle
        ? <SingleChildRenderer
          children={childrenFiltered}
          borderColor={borderColor}
          isBorderLabel={isBorderLabel}
          borderLabel={borderLabel}
          childrenProps={childrenProps}
        />
        : <ArrayChildRenderer
          direction={direction}
          borderColor={borderColor}
          isBorderLabel={isBorderLabel}
          borderLabel={borderLabel}
          children={childrenFiltered}
          childrenProps={childrenProps}
        />}
    </>
  );
}

const SingleChildRenderer = ({children, borderColor, isBorderLabel, borderLabel, childrenProps}) => {
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
        {children}
      </Box>
    </Stack>
  );
}

const ArrayChildRenderer = ({direction, borderColor, isBorderLabel, borderLabel, children, childrenProps}) => {
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
      {children.map((child, index) => {
        const isNotLast = index + 1 < children.length;
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

const BorderLabel = ({ data }) => {
  const IDRenderer = data.valueRenderer;
  return (
    <Box sx={{
      position: 'absolute',
      left: data.shift,
      transform: 'translateX(-50%) translateY(-50%)'
    }}>
      <IDRenderer data={data.value} />
    </Box>
  );
}