import * as React from 'react';
import * as Utils from 'utils/utils';
import { Outlet, useLoaderData, useOutletContext, useParams } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { useResearches } from 'components/Hooks/useResearches';

const StyledRootContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%'
}));

export const EntityPage = () => {
  const params = useParams();
  const context = useOutletContext();
  const entity = useLoaderData();
  const applyResearches = useResearches();

  const modifiedEntity = applyResearches(entity);
  const localizedEntity = Utils.localize(modifiedEntity, context.localization[params.locale]);
  
  return (
    <StyledRootContainer>
      <Outlet context={localizedEntity} />
    </StyledRootContainer>
  );
}