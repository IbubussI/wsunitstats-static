import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea, CardHeader, Typography, styled } from '@mui/material';

const StyledCardId = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(2)
}));

const StyledCardHeader = styled(CardHeader)(() => ({
  textAlign: 'center',
  padding: 0
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1)
}));

const StyledCardActionArea = styled(CardActionArea)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: theme.spacing(1)
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  margin: theme.spacing(2, 2, 1, 2),
}));

const StyledCard = styled(Card)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  transition: 'transform 0.15s ease-in-out',
  [`:hover`]: {
    transform: 'scale3d(1.05, 1.05, 1)'
  }
}));

export const ActionAreaCard = ({ id, size, image, imageSize, name, onClick, children }) => {
  return (
    <StyledCard raised={true} sx={{ width: `${size}px` }}>
      <StyledCardActionArea onClick={onClick}>
        <StyledCardId variant="body2" color="text.secondary">
          {id}
        </StyledCardId>
        <StyledCardMedia
          component="img"
          image={image}
          sx={{
            width: `${imageSize}px`,
            height: `${imageSize}px`
          }}
        />
        <StyledCardHeader title={name} titleTypographyProps={{ variant: 'h6' }} />
        <StyledCardContent sx={{ mt: 'auto' }}>
          {children}
        </StyledCardContent>
      </StyledCardActionArea>
    </StyledCard>
  );
}