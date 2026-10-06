// Types of the data exported by com.wsunitstats.exporter (public/files).
// Units are identified by path ("WarSelection/1/slinger"), researches by index.

export type UnitId = string;
export type ResearchId = number;
export type EntityId = UnitId | ResearchId;

/** Localization keys of a nation name, ir2 is used by nations with a composite name */
export interface NationName {
  ir1: string;
  ir2?: string;
}

export interface Nation {
  name: NationName;
  nationId: number;
}

export interface Tag {
  gameId: number;
  name: string;
  groupName: string;
}

export interface Resource {
  resourceId: number;
  resourceName: string;
  image: string;
  value: number;
}

export interface EntityInfo {
  entityId: EntityId;
  entityName: string;
  entityImage: string;
  entityNation?: Nation;
}

export interface UnitRequirement {
  unitId: UnitId;
  unitName: string;
  unitImage: string;
  unitNation?: Nation;
  quantityStr: string;
  quantityMin: number;
  quantityMax: number;
}

export interface ResearchRequirement {
  researchId: ResearchId;
  researchName: string;
  researchImage: string;
}

export interface Requirements {
  unitsAll?: boolean;
  units?: UnitRequirement[];
  researchAll?: ResearchRequirement[];
  researchAny?: ResearchRequirement[];
}

export interface Distance {
  min?: number;
  max?: number;
  stop?: number;
}

export interface Damage {
  type: string;
  value: number;
}

export interface Buff {
  buffId: ResearchId;
  period?: number;
  entityInfo?: EntityInfo;
  affectedUnits?: Tag[];
}

export interface DamageWrapper {
  areaType: string;
  /** Damage type, matched against typed armor of the target */
  damageType?: number;
  damageFriendly?: boolean;
  radius?: number;
  angle?: number;
  damagesCount: number;
  damages?: Damage[];
  buff?: Buff;
  envDamage?: number;
  envsAffected?: Tag[];
}

export interface Projectile {
  gameId: string;
  speed?: number;
  timeToStartCollision?: number;
}

export interface Weapon {
  weaponId: number;
  weaponType: string;
  enabled?: boolean;
  rechargePeriod: number;
  spread?: number;
  angle?: number;
  distance: Distance;
  damage: DamageWrapper;
  attackGround?: boolean;
  autoAttack?: boolean;
  charges?: number;
  attacksPerAttack: number;
  attacksPerAction: number;
  attackDelay?: number;
  attackTime?: number;
  avgShotTime?: number;
  projectile?: Projectile;
}

export interface Turret {
  turretId: number;
  rotationSpeed?: number;
  weapons: Weapon[];
}

export interface ZonalArmor {
  value: number;
  probability: number;
}

export interface TypedArmor {
  /** Localization key of the damage type, or the type number if it has no name */
  type: string;
  /** Damage multiplier for the damage type, % */
  probability: number;
}

export interface Ability {
  abilityId: number;
  abilityType: number;
  entityInfo?: EntityInfo;
  requirements?: Requirements;
  count?: number;
  duration?: number;
  lifeTime?: number;
  weapon?: number;
  damage?: DamageWrapper;
}

export interface Work {
  workId: number;
  enabled?: boolean;
  makeTime?: number;
  cost: Resource[];
  reserve?: {
    reserveLimit?: number;
    reserveTime?: number;
  };
}

export const CONTAINER_TYPE_ON_ACTION = 0;
export const CONTAINER_TYPE_WORK = 1;
export const CONTAINER_TYPE_ZONE_EVENT = 2;
export const CONTAINER_TYPE_DEATH = 3;

export interface AbilityContainer {
  containerType: number;
  containerName: string;
  enabled?: boolean;
  // work
  ability?: Ability;
  work?: Work;
  // on action, zone event
  abilities?: Ability[];
  // on action
  distance?: Distance;
  onAgro?: boolean;
  rechargeTime?: number;
  // zone event
  size?: number;
  envSearchDistance?: number;
  envTags?: Tag[];
}

export interface Movement {
  speed?: number;
  speedReverse?: number;
  rotationSpeed?: number;
}

export interface Transporting {
  ownSize?: number;
  carrySize?: number;
  onlyInfantry?: boolean;
}

export interface Supply {
  consume?: number;
  produce?: number;
}

export interface Gather {
  gatherId: number;
  resource: Resource;
  envTags: { envId: number; envName: string; envImage: string }[];
  perSecond?: number;
  bagSize?: number;
  angle?: number;
  gatherDistance?: number;
  putDistance?: number;
  findTargetDistance?: number;
  findStorageDistance?: number;
  storageTags?: Tag[];
  unitTags?: Tag[];
}

export interface Heal {
  distance?: number;
  perSecond?: number;
  searchNextDistance?: number;
  autoSearchTargetDistance?: number;
  autoSearchTargetPeriod?: number;
  targetTags?: Tag[];
}

export interface Construction {
  constructionId: number;
  entityInfo?: EntityInfo;
  distance?: number;
  constructionSpeed?: number;
}

export interface Build {
  buildId?: number;
  fullCost?: Resource[];
  initCost?: Resource[];
  healCost?: Resource[];
  initHealth?: number;
  income?: {
    period?: number;
    value?: Resource[];
  };
  requirements?: Requirements;
}

export interface Airplane {
  fuel?: number;
  rechargePeriod?: number;
  refuelSpeed?: number;
  healingSpeed?: number;
  ascensionSpeed?: number;
  flyHeight?: number;
  kamikaze?: boolean;
  aerodromeTags?: Tag[];
}

export interface Submarine {
  underwaterTime?: number;
  swimDepth?: number;
  ascensionSpeed?: number;
  abilityOnFuelEnd?: number;
}

export interface Upgrade {
  upgradeId?: number;
  programId: number;
  programFile?: string;
  parameters?: Record<string, string>;
  unit?: EntityInfo;
}

export interface UnitResearch {
  gameId: ResearchId;
  name: string;
  image: string;
  upgrades: Upgrade[];
}

export interface Unit {
  gameId: UnitId;
  name: string;
  description?: string;
  image: string;
  nation: Nation;
  size?: number;
  viewRange?: number;
  health?: number;
  regenerationSpeed?: number;
  weaponOnDeath?: number;
  controllable?: boolean;
  tags?: Tag[];
  searchTags?: Tag[];
  lifetime?: number;
  parentMustIdle?: boolean;
  receiveFriendlyDamage?: boolean;
  threat?: number;
  weight?: number;
  storageMultiplier?: number;
  abilities?: AbilityContainer[];
  weapons?: Weapon[];
  turrets?: Turret[];
  armorZonal?: ZonalArmor[];
  armorTyped?: TypedArmor[];
  category: string;
  advancedCategory: string;
  killValue: number;
  applicableResearches?: UnitResearch[];
  movement?: Movement;
  transporting?: Transporting;
  supply?: Supply;
  gather?: Gather[];
  heal?: Heal;
  construction?: Construction[];
  build?: Build;
  airplane?: Airplane;
  submarine?: Submarine;
  limit?: number;
}

export interface Research {
  gameId: ResearchId;
  name: string;
  description: string;
  image: string;
  type: string;
  upgrades?: Upgrade[];
}

// context.json
export interface UnitOption {
  gameId: UnitId;
  name: string;
  image: string;
  nation: NationName;
  nationId: number;
  category: string;
  killValue: number;
  searchTags: number[];
  unitTags: number[];
}

export interface ResearchOption {
  gameId: ResearchId;
  name: string;
  description: string;
  image: string;
  type: string;
}

export interface GameContext {
  localeOptions: string[];
  units: UnitOption[];
  researches: ResearchOption[];
}

// units/unitSelector.json
export interface FilterOption {
  gameId: number;
  name: string;
}

export interface NationFilterOption {
  gameId: number;
  name: NationName;
}

export interface UnitSelectorContext {
  unitTags: FilterOption[];
  searchTags: FilterOption[];
  nations: NationFilterOption[];
}
