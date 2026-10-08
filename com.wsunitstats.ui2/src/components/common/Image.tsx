import * as React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { resolveImage } from '@/utils/utils';

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
  /** image name inside files/images, or an absolute path if isStatic */
  path: string;
  width?: number | string;
  height?: number | string;
  isStatic?: boolean;
  sx?: SxProps<Theme>;
};

/** Image by path; a placeholder icon of the same size takes its slot if the image cannot be loaded */
export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const {
    path,
    isStatic,
    ...other
  } = props;
  const src = isStatic ? path : resolveImage(path);
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);

  if (failedSrc === src) {
    const { width, height, sx } = other;
    return (
      <Box
        sx={[
          {
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxSizing: 'border-box',
            backgroundColor: 'action.hover',
            color: 'text.disabled'
          },
          ...(Array.isArray(sx) ? sx : [sx])
        ]}>
        <ImageOutlinedIcon sx={{ width: '70%', height: '70%' }} />
      </Box>
    );
  }

  return (
    <Box ref={ref}
      {...other}
      component="img"
      alt=""
      loading="lazy"
      src={src}
      onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
        setFailedSrc(src);
        other.onError?.(event);
      }}
    />
  );
});
