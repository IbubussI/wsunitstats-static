import type * as React from 'react';
import { SvgIcon, type SvgIconProps } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import UTurnRightIcon from '@mui/icons-material/UTurnRight';
import type { IconAbilityKind } from '@/types/game';

// Icons of the abilities and movement traits shown under the unit image. Composed icons reuse the paths of the
// material icons (DirectionsRun, Park, EmojiPeople, MusicNote) next to the drawn tank, car, bomb, ghost and arrows,
// in the 24x24 view box.

/** Tank facing right in the bottom left corner: tracks with wheels, hull, turret and barrel */
const TANK_PATH = 'M3.5 17H13.5A2.5 2.5 0 0 1 13.5 22H3.5A2.5 2.5 0 0 1 3.5 17Z'
  + 'M2.6 19.5a.9.9 0 1 0 1.8 0a.9.9 0 1 0-1.8 0Z'
  + 'M5.9 19.5a.9.9 0 1 0 1.8 0a.9.9 0 1 0-1.8 0Z'
  + 'M9.2 19.5a.9.9 0 1 0 1.8 0a.9.9 0 1 0-1.8 0Z'
  + 'M12.5 19.5a.9.9 0 1 0 1.8 0a.9.9 0 1 0-1.8 0Z'
  + 'M2.2 16.4L3.6 13.8H13.6L15 16.4Z'
  + 'M5 13.8V12a1 1 0 0 1 1-1h4.6a1 1 0 0 1 1 1v1.8Z'
  + 'M11.6 11.6h6.2v1.3h-6.2Z';
const RUNNING_MAN_PATH = 'M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2z';
const TREE_PATH = 'M17 12h2L12 2 5.05 12H7l-3.9 6h6.92v4h3.96v-4H21z';
const PERSON_ARMS_UP_PATH = 'M15.89 8.11C15.5 7.72 14.83 7 13.53 7h-2.54C8.24 6.99 6 4.75 6 2H4c0 3.16 2.11 5.84 5 6.71V22h2v-6h2v6h2V10.05L18.95 14l1.41-1.41z';
const MUSIC_NOTE_PATH = 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z';
/** Car body from the side facing right: upright rear, roof, sloped windshield and long hood; windows cut out */
const SIDE_CAR_PATH = 'M2 13.2V10.4c0-.6.4-1.1 1-1.2L5.4 9l1.4-2.7c.25-.5.75-.8 1.3-.8h4.7c.55 0 1.05.25 1.35.7L16.6 9l4.5.5c.55.1.9.6.9 1.1v2.6c0 .55-.45 1-1 1h-.8a2.6 2.6 0 0 0-5.2 0H9.2a2.6 2.6 0 0 0-5.2 0H3c-.55 0-1-.45-1-1Z'
  + 'M7.6 7.6h2.8V9H7Z'
  + 'M11.8 7.6h1.6l1.3 1.4H11.8Z';
const SIDE_CAR_WHEELS_PATH = 'M4.6 14.2a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z'
  + 'M15.6 14.2a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z';
/** Long thick arrow under the car pointing left (back) */
const BACK_ARROW_PATH = 'M21 18.4H7.2v-1.6L3 19.4l4.2 2.6v-1.6H21Z';

/** Smaller tank on the ground line (y = 22) at the left, leaving room for what is in front of it */
const SMALL_TANK_TRANSFORM = 'translate(0 4.4) scale(0.8)';
/** The tank scenes take the lower half (y 11-22), moved to the middle of the icon */
const CENTER_VERTICALLY = 'translate(0 -4.5)';
/** Ghost with a wavy hem, hollow eyes and an open mouth */
const GHOST_PATH = 'M12 2C7.58 2 4 5.58 4 10v11.2c0 .66.75 1.04 1.28.64L7 20.6l1.72 1.24a.8.8 0 0 0 .94 0L12 20.2l2.34 1.64a.8.8 0 0 0 .94 0L17 20.6l1.72 1.24c.53.4 1.28.02 1.28-.64V10c0-4.42-3.58-8-8-8Z'
  + 'M7.7 9.5a1.3 1.8 0 1 0 2.6 0a1.3 1.8 0 1 0-2.6 0Z'
  + 'M13.7 9.5a1.3 1.8 0 1 0 2.6 0a1.3 1.8 0 1 0-2.6 0Z'
  + 'M10.4 15a1.6 2.2 0 1 0 3.2 0a1.6 2.2 0 1 0-3.2 0Z';

/** Tank and a man running away in front of it */
const CrushUnitsIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <g transform={CENTER_VERTICALLY}>
      <path fillRule='evenodd' d={TANK_PATH} transform={SMALL_TANK_TRANSFORM} />
      <path d={RUNNING_MAN_PATH} transform='translate(13.4 10.5) scale(0.5)' />
    </g>
  </SvgIcon>
);

/** Tank and a tree falling in front of it */
const CrushEnvsIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <g transform={CENTER_VERTICALLY}>
      <path fillRule='evenodd' d={TANK_PATH} transform={SMALL_TANK_TRANSFORM} />
      <path d={TREE_PATH} transform='rotate(12 19 22) translate(13.24 11.44) scale(0.48)' />
    </g>
  </SvgIcon>
);

/** Scary ghost (fear) */
const GhostIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path fillRule='evenodd' d={GHOST_PATH} />
  </SvgIcon>
);

/** Dancing man with a music note */
const DanceIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <circle cx='12' cy='4' r='2' transform='translate(-1.6 1.5) scale(0.9)' />
    <path d={PERSON_ARMS_UP_PATH} transform='translate(-1.6 1.5) scale(0.9)' />
    <path d={MUSIC_NOTE_PATH} transform='translate(13.6 0) scale(0.45)' />
  </SvgIcon>
);

/** Bomb with a burning fuse */
const BombIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d='M3 15a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z' />
    <path d='M12.3 8.6l2.2-2.2 3.1 3.1-2.2 2.2Z' />
    <path d='M16 7.9c1.2-1.2 1.6-2.6 3.4-3.2' fill='none' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' />
    <path d='M20.5 1.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z' />
  </SvgIcon>
);

/** Arrow with speed lines behind it (gradual acceleration) */
const AccelerateIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d='M2.8 7.8h5.4a.8.8 0 0 1 0 1.6H2.8a.8.8 0 0 1 0-1.6Z' />
    <path d='M1.8 11.2h7.4a.8.8 0 0 1 0 1.6H1.8a.8.8 0 0 1 0-1.6Z' />
    <path d='M2.8 14.6h5.4a.8.8 0 0 1 0 1.6H2.8a.8.8 0 0 1 0-1.6Z' />
    <path d='M11 11h6.5V7.2L23 12l-5.5 4.8V13H11Z' />
  </SvgIcon>
);

/** Car seen from the side facing right, with an arrow under it pointing back (moving backwards) */
const ReverseIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path fillRule='evenodd' d={SIDE_CAR_PATH} />
    <path d={SIDE_CAR_WHEELS_PATH} />
    <path d={BACK_ARROW_PATH} />
  </SvgIcon>
);

/** Half-open gate: frame of two posts and a beam, the left leaf closed and the right one swung inwards */
const GateIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d='M2 22V5l2-2h16l2 2v17h-3V8H5v14Z' />
    <path fillRule='evenodd' d='M5.8 8.8h5.8V22H5.8Z M8.3 10.6h.8v9.6h-.8Z' />
    <path d='M18.2 8.8 14.4 10.8v9.4l3.8 1.8Z' />
  </SvgIcon>
);

/** Icons of the abilities (see IconAbilityKind) and of the movement traits */
export type GlyphKind = IconAbilityKind | 'accelerate' | 'uTurn' | 'reverse';

export const GLYPHS: Record<GlyphKind, React.ComponentType<SvgIconProps>> = {
  crushUnits: CrushUnitsIcon,
  crushEnvs: CrushEnvsIcon,
  selfBuff: SpeedIcon,
  areaBuff: GhostIcon,
  scatter: BombIcon,
  dance: DanceIcon,
  autoTransform: GateIcon,
  accelerate: AccelerateIcon,
  uTurn: UTurnRightIcon,
  reverse: ReverseIcon
};
