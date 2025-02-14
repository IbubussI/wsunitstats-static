import * as React from 'react';
import { Box, styled } from '@mui/material';
import { EntitySelectorView } from 'components/Pages/EntitySelectorPage/EntitySelectorView';
import { useLoaderData, useOutletContext, useSearchParams } from 'react-router-dom';

const StyledRootContainer = styled(Box)(() => ({
  width: '100%'
}));

export const EntitySelectorPage = ({ selectorOptions, getSelectorOptions }) => {
  const [searchParams ] = useSearchParams();
  const rootContext = useOutletContext();
  const selectorContext = useLoaderData();
  const options = getSelectorOptions(rootContext, searchParams);
  
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