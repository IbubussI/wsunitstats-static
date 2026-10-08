import * as React from 'react';
import { Box, Button, Container, Drawer, Grid, Toolbar, Typography } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';

interface EntitySelectorViewProps<T> {
  title: string;
  options: T[];
  getKey: (option: T) => React.Key;
  renderCard: (option: T) => React.ReactNode;
  /** filters panel content, shown in a drawer */
  filters?: React.ReactNode;
}

/** Grid of entity cards loaded by portions on scroll */
export const EntitySelectorView = <T,>({ title, options, getKey, renderCard, filters }: EntitySelectorViewProps<T>) => {
  const { t } = useTranslation();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [shownCount, setShownCount] = React.useState(Constants.SELECTOR_OPTIONS_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const hasMore = shownCount < options.length;

  // show only the first portion when the option list changes
  React.useEffect(() => {
    setShownCount(Constants.SELECTOR_OPTIONS_SIZE);
  }, [options]);

  // show next portion when the end of the list is visible
  React.useEffect(() => {
    if (!hasMore) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShownCount(count => count + Constants.SELECTOR_OPTIONS_SIZE);
      }
    }, { rootMargin: '250px' });
    observer.observe(sentinelRef.current!);
    return () => observer.disconnect();
  }, [hasMore, shownCount]);

  return (
    <Container maxWidth='xl'>
      {filters && <Drawer
        anchor="top"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        ModalProps={{ keepMounted: true }}>
        {filters}
      </Drawer>}

      <Box component='main' sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h4" color="text.primary" sx={{ py: 3 }}>
            {title}
          </Typography>
          {filters && <Button
            variant="outlined"
            startIcon={<FilterAltIcon />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{ mx: 1 }}>
            {t('entityPageFiltersUnits')}
          </Button>}
        </Toolbar>
        <Grid container spacing={4}>
          {options.slice(0, shownCount).map((option) =>
            <Grid key={getKey(option)} item sx={{ display: 'flex' }}>
              {renderCard(option)}
            </Grid>
          )}
        </Grid>
        <div ref={sentinelRef} />
      </Box>
    </Container>
  );
};
