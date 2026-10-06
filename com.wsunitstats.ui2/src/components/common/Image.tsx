import * as React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { resolveImage } from '@/utils/utils';

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
  /** image name inside files/images, or an absolute path if isStatic */
  path: string;
  width?: number | string;
  height?: number | string;
  isStatic?: boolean;
  sx?: SxProps<Theme>;
};

export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const {
    path,
    isStatic,
    ...other
  } = props;
  return (
    <Box ref={ref}
      {...other}
      component="img"
      alt=""
      loading="lazy"
      src={isStatic ? path : resolveImage(path)}
    />
  );
});
