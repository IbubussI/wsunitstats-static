import { Box, Stack, Tooltip, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { localizeNation } from '@/utils/utils';
import { GridGroup, ResizableGrid } from '@/components/layout/ResizableGrid';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { CostTable } from '@/components/layout/KeyValueTable';
import { RequirementsButton } from '@/components/layout/RequirementsButton';
import { EntityInfo } from '@/components/common/EntityInfo';
import { HeaderChip } from '@/components/common/HeaderChip';
import type { EntityInfo as Entity, Requirements, Resource, Unit, UnitSource } from '@/types/game';

const MIN_WIDTH = 280;
const COLUMN_WIDTH = 480;
/** Same as the borders between frame sections */
const FRAME_BORDER = { border: 0, borderStyle: 'solid', borderColor: 'primary.dark' } as const;

/** Source types in the order they are listed, with the label of their parent units */
const SOURCE_TYPES: Record<string, string> = {
  unitCostSourceTypeBuilding: 'sourceParentsBuilding',
  unitCostSourceTypeCreate: 'sourceParentsCreate',
  unitCostSourceTypeTransform: 'sourceParentsTransform',
  unitCostSourceTypeDeath: 'sourceParentsDeath',
  unitCostSourceTypeWeapon: 'sourceParentsWeapon'
};
const TYPE_ORDER = Object.keys(SOURCE_TYPES);

/** Parents of a source that share the same requirements */
interface SourceVariant {
  requirements?: Requirements;
  parents: Entity[];
}

/** Sources of the same type, cost and full chain cost */
interface SourceEntry {
  type: string;
  cost?: Resource[];
  /** whole chain cost of the transformation */
  fullChainCost?: Resource[];
  /** distinct cheapest routes from the first created or built unit to the parents, chosen among alternatives */
  routes: Entity[][];
  variants: SourceVariant[];
}

const costKey = (cost?: Resource[]) => cost?.map(resource => `${resource.resourceId}:${resource.value}`).join(',') ?? '';

/** Orders costs the way the exporter weighs resources to find the cheapest cost */
const costValue = (cost?: Resource[]) => cost?.reduce((sum, resource) =>
  sum + resource.value * (resource.resourceId === 2 ? 1.5 : 1), 0) ?? 0;

/** Groups the sources by type, cost and full chain cost; parents of a group are split by their requirements */
export const groupSources = (sources: UnitSource[]): SourceEntry[] => {
  const entries = new Map<string, SourceEntry>();
  for (const source of sources) {
    const key = [source.sourceType, costKey(source.cost), costKey(source.fullChainCost)].join('|');
    let entry = entries.get(key);
    if (!entry) {
      entry = { type: source.sourceType, cost: source.cost, fullChainCost: source.fullChainCost, routes: [], variants: [] };
      entries.set(key, entry);
    }
    const route = source.fullChainRoute;
    const routeKey = (units: Entity[]) => units.map(unit => unit.entityId).join('>');
    // a single possible route, or a route of the parent alone (created or built directly), tells nothing new
    if (route && route.length > 1 && source.fullChainRouteHasAlternatives
      && !entry.routes.some(other => routeKey(other) === routeKey(route))) {
      entry.routes.push(route);
    }

    const requirementsKey = JSON.stringify(source.requirements ?? null);
    let variant = entry.variants.find(variant => JSON.stringify(variant.requirements ?? null) === requirementsKey);
    if (!variant) {
      variant = { requirements: source.requirements, parents: [] };
      entry.variants.push(variant);
    }
    const parent = source.sourceInfo;
    if (parent && !variant.parents.some(other => other.entityId === parent.entityId)) {
      variant.parents.push(parent);
    }
  }
  return [...entries.values()].sort((first, second) =>
    TYPE_ORDER.indexOf(first.type) - TYPE_ORDER.indexOf(second.type)
    || costValue(first.cost) - costValue(second.cost)
    || costValue(first.fullChainCost) - costValue(second.fullChainCost));
};

export const SourcesTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const entries = groupSources(unit.sources ?? []);

  return (
    <>
      <h3>{t('sourcesTabTitle')}</h3>
      <ResizableGrid minWidth={MIN_WIDTH}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          {entries.map((entry, index) => <SourceTable key={index} entry={entry} unit={unit} />)}
        </GridGroup>
      </ResizableGrid>
    </>
  );
};

const SourceTable = ({ entry, unit }: { entry: SourceEntry; unit: Unit }) => {
  const { t } = useTranslation();
  // a chain cost equal to the cost tells nothing new
  const fullChainCost = entry.fullChainCost && costKey(entry.fullChainCost) !== costKey(entry.cost)
    ? entry.fullChainCost
    : undefined;
  const self: Entity = { entityId: unit.gameId, entityName: unit.name, entityImage: unit.image, entityNation: unit.nation };
  const routes = fullChainCost ? entry.routes : [];

  return (
    <Frame column label={<HeaderChip label={t(entry.type)} />} labelShift='80px'>
      <FrameSection sx={{ padding: 0 }}>
        <Stack direction='row'>
          <Stack sx={{ ...FRAME_BORDER, borderRightWidth: '1px', padding: '4px', paddingTop: '14px' }}>
            {entry.cost
              ? <CostTable label={t('workAbilityCostLabel')} cost={entry.cost} />
              : <Box sx={{ width: '150px', padding: '7px', boxSizing: 'border-box' }}>
                <Typography variant='body2' color='text.primary'>{t('workAbilityCostLabel')}</Typography>
                <Typography sx={{ paddingTop: '3px' }}>{t('sourceFree')}</Typography>
              </Box>}
            {fullChainCost && <Box sx={{ ...FRAME_BORDER, borderTopWidth: '1px', margin: '0 -4px', padding: '0 4px', paddingTop: '4px' }}>
              <CostTable label={<FullCostLabel />} cost={fullChainCost} />
            </Box>}
          </Stack>
          <Box sx={{ padding: '4px', paddingTop: '14px', flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ padding: '7px', paddingBottom: 0 }}>
              <Typography variant='body2' color='text.primary'>
                {t(SOURCE_TYPES[entry.type] ?? 'sourceParentsCreate')}
              </Typography>
            </Box>
            {entry.variants.map((variant, index) => <Stack key={index} sx={{
              padding: '7px',
              gap: '5px',
              // parents with other requirements are split by a line
              borderTop: index > 0 ? '1px dashed' : undefined,
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '5px' }}>
                {variant.parents.map(parent => <EntityLink key={parent.entityId} entity={parent} />)}
              </Box>
              <RequirementsButton requirements={variant.requirements} fitContent />
            </Stack>)}
          </Box>
        </Stack>
      </FrameSection>
      {!!routes.length && <FrameSection>
        <Box sx={{ padding: '7px' }}>
          <Typography variant='body2' color='text.primary'>
            {t('sourceCheapestRouteLabel')}
          </Typography>
          {routes.map((route, index) => <RouteChain key={index} route={[...route, self]} />)}
        </Box>
      </FrameSection>}
    </Frame>
  );
};

/** Full cost label with a tooltip explaining it */
const FullCostLabel = () => {
  const { t } = useTranslation();
  return (
    <Tooltip arrow title={t('sourceFullChainCostTooltip')}>
      <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'help' }}>
        {t('sourceFullChainCostLabel')}
        <HelpOutlineIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
      </Box>
    </Tooltip>
  );
};

const EntityLink = ({ entity, current }: { entity: Entity; current?: boolean }) => {
  const { t } = useTranslation();
  return (
    <EntityInfo
      primary={t(entity.entityName)}
      secondary={localizeNation(t, entity.entityNation?.name)}
      image={entity.entityImage}
      // the unit of the page is not a link
      route={current ? null : Constants.UNIT_PAGE_PATH}
      id={entity.entityId}
      overflow />
  );
};

/** Units turning into each other, the last one is the unit of the page */
const RouteChain = ({ route }: { route: Entity[] }) => (
  <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', columnGap: '6px', rowGap: '5px', paddingTop: '5px' }}>
    {route.map((entity, index) => <Stack key={index} direction='row' alignItems='center' sx={{ gap: '6px', minWidth: 0 }}>
      {index > 0 && <ArrowForwardIcon fontSize='small' sx={{ color: 'text.secondary' }} />}
      <EntityLink entity={entity} current={index === route.length - 1} />
    </Stack>)}
  </Stack>
);
