import * as React from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { Box, styled } from '@mui/material';

const StyledRootContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%'
}));

export const EntityPage = () => {
  const loaderData = useLoaderData();
  const entity = loaderData ? loaderData[0] : undefined;

  return (
    <StyledRootContainer>
      <Outlet context={entity} />
    </StyledRootContainer>
  );
}