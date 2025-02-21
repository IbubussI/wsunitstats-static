import * as React from 'react';
import { Navigate, Outlet, useLoaderData, useParams } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { useResearches } from 'components/Hooks/useResearches';

const StyledRootContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%'
}));

export const EntityPage = () => {
  const params = useParams();
  const entity = useLoaderData();
  const applyResearches = useResearches();

  if (!entity || typeof entity !== "object") {
    return <Navigate
      to={`/${params.locale}/error`}
      state={{ msg: "Requested entity is not found", code: 404 }} replace={true} />;
  }

  const modifiedEntity = applyResearches(entity);

  return (
    <StyledRootContainer>
      <Outlet context={modifiedEntity} />
    </StyledRootContainer>
  );
}