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

/** Units in the radius of the unit get the researches */
export interface Aura {
  auraId: number;
  radius?: number;
  researches: EntityInfo[];
  /** absent - all units */
  affectedUnits?: Tag[];
  affectsAllies: boolean;
  affectsEnemies: boolean;
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

export const CONTAINER_TYPE_WORK = 1;
export const CONTAINER_TYPE_DEATH = 3;
export const CONTAINER_TYPE_ICON = 4;

export type IconAbilityKind = 'crushUnits' | 'crushEnvs' | 'selfBuff' | 'areaBuff' | 'scatter' | 'dance';
export type AbilityTrigger = 'action' | 'zone' | 'weapon' | 'script';

/** Ability shown as an icon, only the fields of its kind are set */
export interface IconAbility {
  icon: IconAbilityKind;
  trigger: AbilityTrigger;
  abilityIds: number[];
  /** false if the ability is enabled by a research */
  enabled?: boolean;
  rechargeTime?: number;
  distance?: Distance;
  /** buff (research) the ability gives */
  research?: EntityInfo;
  researchDescription?: string;
  duration?: number;
  /** damage to units under the unit (crush units) */
  damages?: Damage[];
  damageRadius?: number;
  /** damage to envs (crush envs) */
  envDamage?: number;
  affectedEnvs?: Tag[];
  /** units in the radius move away and get the buff */
  radius?: number;
  moveDistance?: number;
  /** absent - all units */
  affectedUnits?: Tag[];
  affectsAllies?: boolean;
  affectsEnemies?: boolean;
  /** unit created together with the ability (e.g. the bomb of the saboteur) */
  createdUnit?: EntityInfo;
}

export interface AbilityContainer {
  containerType: number;
  containerName: string;
  // work, death
  ability?: Ability;
  work?: Work;
  // icon
  abilities?: IconAbility[];
}

export interface Movement {
  speed?: number;
  speedReverse?: number;
  rotationSpeed?: number;
  /** speed gained per second, absent if the unit gets full speed at once */
  acceleration?: number;
  /** rotation speed gained per second, absent if the unit gets full rotation speed at once */
  rotationAcceleration?: number;
  /** can't turn on the spot, turns along an arc */
  smoothTurn?: boolean;
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
  additionalClassifiers: AdditionalClassifiers;
  applicableResearches?: UnitResearch[];
  movement?: Movement;
  transporting?: Transporting;
  supply?: Supply;
  gather?: Gather[];
  heal?: Heal;
  aura?: Aura;
  construction?: Construction[];
  build?: Build;
  sources?: UnitSource[];
  airplane?: Airplane;
  submarine?: Submarine;
  limit?: number;
}

/** Unit classes the game has no tag for, derived from the unit data */
export interface AdditionalClassifiers {
  /** tanks, armored cars, APCs and other armed land vehicles */
  isGroundCombatVehicle: boolean;
}

export interface UnitSource {
  /** unitCostSourceType* */
  sourceType: string;
  /** cost of the last step, absent for free sources (on death, by weapon) */
  cost?: Resource[];
  /** transformations only: cost of the transformation plus the cheapest cost of obtaining the parent */
  fullChainCost?: Resource[];
  /** transformations only: units of the cheapest route from the first created or built one to the parent */
  fullChainRoute?: EntityInfo[];
  /** transformations only: the parent can be obtained by more than one route, so the cheapest one is worth showing */
  fullChainRouteHasAlternatives?: boolean;
  /** unit that creates, turns into or builds this unit */
  sourceInfo?: EntityInfo;
  requirements?: Requirements;
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
  advancedCategory: string;
  killValue: number;
  additionalClassifiers: AdditionalClassifiers;
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
  /** "{engine}.{gameplay}_{main}" versions of the game files, e.g. 252.4005_29231 */
  gameVersion?: string;
  /** date of the export, yyyy-MM-dd */
  exportDate?: string;
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

// researches/researchSelector.json
export interface ResearchTypeOption {
  id: number;
  /** localization key, the same as ResearchOption type */
  name: string;
}

export interface ResearchSelectorContext {
  researchTypes: ResearchTypeOption[];
}
