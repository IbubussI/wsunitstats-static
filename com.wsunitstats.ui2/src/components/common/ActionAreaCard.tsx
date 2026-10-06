import * as React from 'react';
import { Card, CardActionArea, CardContent, CardHeader, CardMedia, styled } from '@mui/material';
import { Link } from 'react-router-dom';

const StyledCard = styled(Card)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  transition: 'transform 0.15s ease-in-out',
  ':hover': {
    transform: 'scale3d(1.05, 1.05, 1)'
  }
}));

interface ActionAreaCardProps {
  size: number;
  image: string;
  imageSize: number;
  name: string;
  link: string;
  children?: React.ReactNode;
}

export const ActionAreaCard = ({ size, image, imageSize, name, link, children }: ActionAreaCardProps) => (
  <StyledCard raised={true} sx={{ width: `${size}px` }}>
    <CardActionArea component={Link} to={link} sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      p: 1
    }}>
      <CardMedia
        component="img"
        image={image}
        sx={{ m: 2, mb: 1, width: `${imageSize}px`, height: `${imageSize}px` }}
      />
      <CardHeader title={name} sx={{ textAlign: 'center', p: 0 }}
        slotProps={{ title: { variant: 'h6', lineHeight: 1.3 } }} />
      <CardContent sx={{ textAlign: 'center', p: 1, mt: 'auto' }}>
        {children}
      </CardContent>
    </CardActionArea>
  </StyledCard>
);
