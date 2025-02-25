import * as React from 'react';
import { Box, styled } from '@mui/material';
import { EntitySelectorView } from 'components/Pages/EntitySelectorPage/EntitySelectorView';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { useContext } from 'react';
import { GameDataContext } from 'gameDataContext';

const StyledRootContainer = styled(Box)(() => ({
  width: '100%'
}));

export const EntitySelectorPage = ({ selectorOptions, getSelectorOptions }) => {
  const [searchParams ] = useSearchParams();
  const gameContext = useContext(GameDataContext);
  const selectorContext = useLoaderData();
  const options = getSelectorOptions(gameContext, searchParams);
  
  return (
    // key here is required to force remount the selector grid component upon data source change
    // to avoid rendering old data on the new page (avoid data-fetch related flicker)
    <StyledRootContainer>
      <EntitySelectorView
        key={selectorOptions.title}
        options={options}
        selectorContext={selectorContext}
        {...selectorOptions} />
    </StyledRootContainer>
  );
}