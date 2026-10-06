import { Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { localizeNation, withUnits } from '@/utils/utils';
import { StatTable } from '@/components/layout/StatTable';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { TagBox } from '@/components/common/TagBox';
import { EntityImage } from '@/components/common/misc';
import type { TypedArmor, Unit } from '@/types/game';
import { ArmorChart } from './ArmorChart';
import { TabLayout } from './TabLayout';

const ARMOR_COLORS = [
  'rgba(122, 16, 16, 1)',
  'rgba(168, 87, 15, 1)',
  'rgba(168, 116, 15, 1)',
  'rgba(15, 132, 21, 1)',
];

export const CommonTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const bool = (value?: boolean) => t(String(!!value));
  const transporting = unit.transporting;

  const rows = [
    { label: t('gameID'), value: unit.gameId },
    { label: t('commonNationCell'), value: localizeNation(t, unit.nation.name) },
    { label: t('commonHealthCell'), value: unit.health },
    { label: t('commonViewRangeCell'), value: unit.viewRange },
    { label: t('commonSizeCell'), value: unit.size },
    { label: t('commonRegenerationSpeedCell'), value: withUnits(unit.regenerationSpeed, t('hpSecMarker')) },

    { label: t('commonMovementSpeedCell'), value: unit.movement?.speed },
    { label: t('commonReverseSpeedCell'), value: unit.movement?.speedReverse },
    { label: t('commonRotationSpeedCell'), value: unit.movement?.rotationSpeed },

    { label: t('commonTransportingSizeCell'), value: transporting?.ownSize },
    { label: t('commonTransportingCapacityCell'), value: transporting?.carrySize },
    {
      label: t('commonCanTransportCell'),
      value: transporting?.carrySize ? t(transporting.onlyInfantry ? 'commonCanTransportInfantry' : 'commonCanTransportAll') : null
    },

    { label: t('commonTakesPopCell'), value: unit.supply?.consume },
    { label: t('commonGivesPopulationCell'), value: unit.supply?.produce },
    { label: t('commonLimitCell'), value: unit.limit },

    { label: t('commonReceivesFriendlyCell'), value: bool(unit.receiveFriendlyDamage) },
    { label: t('commonParentNotMoveCell'), value: unit.parentMustIdle ? bool(true) : null },
    { label: t('commonControllableCell'), value: bool(unit.controllable) },

    { label: t('commonStorageEfficiencyCell'), value: withUnits(unit.storageMultiplier, '%') },

    { label: t('commonThreatCell'), value: unit.threat },
    { label: t('commonWeightCell'), value: unit.weight },
    { label: t('commonDeathWeaponCell'), value: unit.weaponOnDeath != null ? 'W' + unit.weaponOnDeath : null },
  ];

  const hasZonalArmor = !!unit.armorZonal?.length;
  const hasTypedArmor = !!unit.armorTyped?.length;

  return (
    <TabLayout title={t('commonTitle')} minWidth={400} columnWidth={500} paddingTop={1}>
      <Stack spacing={0.5}>
        <Frame>
          <FrameSection>
            <Stack alignItems='center'>
              <h4 style={{
                marginBlockStart: '0.4em',
                marginBlockEnd: '0.65em',
                maxWidth: '150px',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}>{t(unit.name)}</h4>
              <EntityImage image={unit.image} size='150px' />
              {unit.description &&
                <Typography variant='body2' align='center' sx={{ maxWidth: '150px', pt: 0.5 }}>
                  {t(unit.description)}
                </Typography>}
              {(hasZonalArmor || hasTypedArmor) && <h4>{t('commonArmorTitle')}</h4>}
              {hasZonalArmor && <>
                <ArmorSubtitle text={t('commonArmorZonal')} />
                <ArmorChart content={unit.armorZonal!} colors={ARMOR_COLORS} />
              </>}
              {hasTypedArmor && <>
                <ArmorSubtitle text={t('commonArmorTyped')} note={t('commonArmorTypedNote')} />
                <TypedArmorTable armor={unit.armorTyped!} />
              </>}
            </Stack>
          </FrameSection>
          <FrameSection sx={{ overflow: 'auto', width: '100%' }}>
            <StatTable rows={rows} minWidth={200} />
          </FrameSection>
        </Frame>
        <Frame column>
          <FrameSection>
            <TagBox label={t('tagContainerSearch')} tags={unit.searchTags} />
            <TagBox label={t('tagContainerUnit')} tags={unit.tags} />
          </FrameSection>
        </Frame>
      </Stack>
    </TabLayout>
  );
};

const ArmorSubtitle = ({ text, note }: { text: string; note?: string }) => (
  <Stack alignItems='center' sx={{ pt: 1, pb: 0.5 }}>
    <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
      {text}
    </Typography>
    {note && <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1 }}>
      {note}
    </Typography>}
  </Stack>
);

/** Damage multiplier by damage type (see weapon damage type) */
const TypedArmorTable = ({ armor }: { armor: TypedArmor[] }) => {
  const { t } = useTranslation();
  return (
    <TableContainer sx={{ width: 'fit-content', pb: 1 }}>
      <Table>
        <TableBody>
          {armor.map((entry) => (
            <TableRow key={entry.type} sx={{
              '& td': {
                p: '3px',
                verticalAlign: 'middle',
                border: 0
              }
            }}>
              <TableCell>
                <Typography variant='body2'>
                  {t(entry.type)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body2'>
                  : {entry.probability}%
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
