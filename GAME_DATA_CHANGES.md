# War Selection game data: what changed (content packs update)

Inventory of every difference between the game data the exporter was built for (state at commit `2293bfd`)
and the current game files (engine version 251), as input for deciding how to model and display the new data.

> Engine 252 (2026-10-06) moved all interfaces from `Projects/WarSelection/interfaces/` to `Content/interfaces/WarSelection/`.
> The full diff below was not re-run for 252; the exporter's strict reading of units, envs, projectiles and gameplay.json
> found no new unknown fields there.

**How it was produced**
- *Old format* = the Java JSON models at `HEAD`. The exporter mapped game files with Jackson's default
  `FAIL_ON_UNKNOWN_PROPERTIES`, so the old models were a complete description of every field of the old data
  (except fields typed as `Object`, see section 11).
- *New format* = union schema of all 453 `unit.json`, 224 `env.json`, 82 `projectile.json` (extracted from the `.pack` files),
  plus `gameplay.json`, `visual.json`, `main.json`, Lua scripts and UI atlases.
- *Old values* = the previous export `entities.json` (Aug 15).
- Counts are "number of units having it". "e.g." lists unit paths relative to `WarSelection/`.
- Meanings marked *(guess)* are inferred from names/values, not confirmed.

---

## 1. Storage layout

| Before | Now |
|---|---|
| `Cache/project/WarSelection/gameplay.json` → `scenes.units[]`, `scenes.envs[]`, `scenes.projectiles[]` (arrays indexed by int id) | One `.pack` file per entity: `Cache/Content/units/WarSelection/<path>.pack`, `Content/envs/...`, `Content/projectiles/...` |
| `visual.json` → `unitTypes[]` (visual data of units, by int id) | `visual` section inside the same unit `.pack` |
| Unit names/descriptions in `localization/*.loc` (`<*unitName8>`) | `localization` section inside each pack, per locale, keys with placeholder: `"unitName{id}"`, `"unitText{id}"`, `"envName{id}"` |
| Icons: PNG textures referenced by `main.json` → `globalContent` / `visualSessionContent` (+ crop rects) | KTX2 textures: `icon.ktx2` inside the pack, or a reference to a UI atlas `Content/ui/<atlas>.{ktx2,json}` |
| Lua scripts compiled (bytecode) in `Cache/scripts/WarSelection/compiled/...` | Lua **source** in `Cache/Projects/WarSelection/scripts/...`, `interfaces/.../scripts/...`, `Cache/CommonScripts/...` |
| Folder `Cache/project/` | Folder `Cache/Projects/` |

`.pack` = `GEMPACK` container: entries `unit.json` (all 453 units) and `icon.ktx2` (322 units; 8 envs).
Entries of `unit.json`: `gameplay` (= old `scenes.units[i]`), `visual` (= old `visual.json unitTypes[i]`), `localization`.

## 2. Identity: paths instead of integer ids

Units, envs and projectiles are identified by path (`"WarSelection/2/e/archer"`) – the folder layout of the packs
(`1..5` = ages, `e/a/ee/ew/ae/aw` = Europe/Asia/... branches, `4/de`, `5/ja`... = countries, `animals`, `decor`, `horde`, `helpers`).
Researches and upgrades **still use integer ids** (list indices in `gameplay.json`).

Every reference that changed from int to path string:

| Field | Units having it |
|---|---|
| `gameplay.json build[].unit` | 122 entries |
| `gameplay.json build[].requirements.units[].type` | 24 entries |
| `gameplay.json researches.upgrades[].unit` | 257 entries |
| `unit.gameplay.ability.abilities[].data.unit` | 235 |
| `unit.gameplay.ability.abilities[].requirements.units[].type` | 97 |
| `unit.gameplay.attack.weapons[].projectile` | 119 |
| `unit.gameplay.attack.turrets[].weapons[].projectile` | 83 |
| `unit.gameplay.movement.building[].id` | 12 |
| `unit.gameplay.createEnvs[].env` **(new field, replaces `tag`)** | 315 |
| `unit.visual.icon`, `unit.visual.skins_[].object[]`, emitters, ... | (visual assets) |

`Projects/WarSelection/legacyIds.json` maps the old int ids to paths (`units` 453, `envs` 459 incl. 235 retired, `projectiles` 82,
`createTags`, `decorTags`). It is temporary and the exporter does not use it. A snapshot is kept in the site's static files
(`com.wsunitstats.ui2/public/static/legacyIds.json`): replays recorded before the change reference units by these old int ids,
while newer replays carry their own index → path mapping in `extraData["7"]`.

**Exporter identifiers.** The exported data uses the game's identifiers as they are: units, envs and projectiles by path,
researches and upgrades by index. Entities are accessed through `EntityProvider` / `EntityId` (package `entity`); only the
game files reading (`FileContentServiceImpl`, `content.entity`) knows which kind uses which form, so e.g. moving researches
to paths is a one-line change there. What this changes in the exported data (UI work pending):

| | Before | Now |
|---|---|---|
| Unit / env / projectile id (`gameId`, `entityId`, `unitId`, `projectile.gameId`) | `8` | `"WarSelection/1/slinger"` |
| Research / upgrade id | `12` | `12` (unchanged) |
| Unit JSON file | `units/8.json` | `units/WarSelection/1/slinger.json` |
| Image name (all kinds) | `unit8.png`, `upgrade12.png`, `resource0.png` | `unit/WarSelection/1/slinger.png`, `upgrade/12.png`, `resource/0.png` |
| Unit name/text key | `<*unitName8>` | `<*unitNameWarSelection/1/slinger>` (key charset now includes `_ - .`) |
| Env name key (own names) | `<*envName37>` | `<*envNameWarSelection/nature/decor/rock/deposit/metal/copper/dead>` |
| Part of a multipart entry | `<*upgrade12/0>`, `<*unitTag/13>`, `<*nationName13/1>` | `<*upgrade12#0>`, `<*unitTag#13>`, `<*nationName13#1>` (the game writes `/N`; the exporter converts game keys read from scripts, since `/` also separates path segments) |
| Order of units in lists (`context.units`, unit selector) | by legacy id | by path |
| Order of a unit's `sources` | by legacy id of the source | by path of the source; `fullChainCost` takes the first source's cost, so it can differ for units with several sources (seen for 3 units: 4/aero, 4/location_station/*) |

UI places that assume numeric unit ids: routes `/units/:gameId`, `context.units[unitTypeId]` in the replay parser
(array index), `EntityPicker` (`typeof gameId === 'number'`), hardcoded `/files/images/resource0.png`..`resource2.png`,
`LOCALIZATION_REGEX` (`[a-zA-Z0-9/]`, must also accept `_ - .` and the `#N` part suffix: exporter uses
`<\*[a-zA-Z0-9/_.\-]+(#[0-9]+)?>`), hardcoded `t("<*unitText293>")` in `CommonTable/index.jsx`.

Localization values from content packs are single values (`|` is plain text there, unlike in `.loc` lines).
In `.loc` lines trailing empty parts are kept, so `<*upgrade66>Next country|` exports `<*upgrade66#0>` like other researches.

## 3. New fields – unit gameplay

| Path | Units | e.g. | Sample | Meaning *(guess)* |
|---|---|---|---|---|
| `deathability.armor_.zonal[]` | 446 | 1/barracks, 1/maceman | `[{"object":0,"probability":60},{"object":2000,"probability":20},...]` | **Replaces `armor_.data`** – same entries (armor value per hit zone + probability) |
| `deathability.armor_.typed{}` | 175 | all buildings: 1/barracks, 1/depot, 1/tower | `{"1":26214}` | **New mechanic**: armor multiplier by damage type (26214/65536 = 0.4) – buildings take 40% from damage type 1 |
| `attack.weapons[].damage.type` | 63 | 1/slinger, 2/a/archer_heavy | `1` | **New mechanic**: damage type of the weapon, matched against `armor_.typed`. Only value used: `1` (ranged weapons – archers, slingers, towers) |
| `attack.turrets[].weapons[].damage.type` | 41 | 1/tower, 3/a/djong | `1` | same, for turrets |
| `attack.weapons[].elevation` | 42 | 3/ae/arquebusier, 3/ae/cannon/elevation | `{"maxAngle":894784853,"minAngle":-715827882,"pivot":[0,0,24320],"restAngle":11405783,"speed":715827882}` | Vertical aiming of the weapon (angles/speed in the game's angle units) |
| `attack.turrets[].weapons[].elevation` | 50 | 3/a/djong, 4/aaw | same shape | same, for turrets |
| `attack.weapons[].directionAttacks.defaultValue.points[].elevationPivot` | 6 | 3/ae/cannon/elevation | `[15951,407,5800]` | Pivot of the elevation per shot point |
| `attack.turrets[].weapons[].directionAttacks...points[].elevationPivot` | 16 | 4/aaw | `[-244,-9621,20571]` | same |
| `attack.weapons[].abilities` | 3 | 4/it/airplane_bomber(_heavy), 4/pl/saboteur | `[0]`, `[0,1]` | **New mechanic**: abilities triggered by the weapon (see section 6) |
| `attack.weapons[].damage.buff.priorityMult` | 51 | 2/a/lance_knight | `98304` | Buff priority multiplier (98304 = 1.5, 78643 = 1.2) |
| `attack.turrets[].weapons[].damage.buff.priorityMult` | 39 | 4/aero/military | `78643` | same |
| `ability.abilities[].data.buff.priorityMult` | 4 | 4/de/agent, 4/pl/saboteur_bomb, 5/ja/fugo | `98304` | same, for damage abilities |
| `ability.abilities[].data.buff.duration` | 8 | 3/aw/elephant* , 4/ind/elephant* | `3000` | Buff duration (ms) – elephants' "Panic" buff (research 155) |
| `ability.abilities[].data.ally` / `.enemy` | 8 | 3/aw/elephant* | `false` / `true` | Which side the (type 8) ability affects |
| `ability.abilityOnAction.anyAction` | 8 | 3/aw/elephant* | `true` | Action ability triggers on any action, not only a specific one |
| `movement.speedReverse_` | 84 | 2/a/boat_archer, ships, vehicles | `320` | Reverse movement speed (same units as `speed_`) |
| `movement.rotationAccel` | 66 | 2/a/fisher, ships | `10240000` | Rotation acceleration (angle units) |
| `movement.turnPivot` | 17 | 4/chn/armored_car, 4/hu/apc | `4962` | Pivot point of turning (vehicles) |

## 4. New fields – unit visual / other files

| Path | Units | Sample | Notes |
|---|---|---|---|
| `unit.visual.icon` | 131 | `"WarSelection/icons/units/2/archer#default"` | Icon reference (`<ui atlas>#<image>`) when the icon is not inside the pack. Every unit has exactly one of `icon.ktx2` / `visual.icon` |
| `unit.visual.abilities` | 30 | `[null,{}]`, `[[2,{}]]`, `[21]` | Visual config per ability (tanks, agents, kamikaze) – content unclear |
| `unit.visual.externalData` → `weaponAbility` | 6 | `{"1":{"weapon":3,"ground":false,"single":true,"cursor":4,"icon":"WarSelection/icons/units/4/shared#tempAbility0.png","name":"<*unitAbility0/0>","text":"<*unitAbility0/1>","count":false}}` | **Replaces the old script abilities** (section 6). Units: 4/chn/soldier, 4/it/airplane_bomber, 4/it/airplane_bomber_heavy, 4/pl/saboteur, 5/ja/battleship, 5/ja/bomber |
| `env.visual.icon` | 54 envs | `"WarSelection/icons/envs/copper#default"` | Env icon reference (8 more envs have `icon.ktx2` in the pack) |
| `env.localization` `envName{id}` | 14 envs | `"Copper vein"` | Own env names (others use shared keys, see 9) |
| `gameplay.json scenes.unitOverrides` | 1 | `{"WarSelection/3/ae/springald": {"attack":{"weapons":[...]}}}` | Per-unit patch over the pack data (merge: objects merged, arrays replaced). Springald: weapon without `directionAttacks.container`, with `elevation` |
| `visual.json unitOverrides` | 1 | `{"WarSelection/3/ae/springald":{"attack":{"weapons":[{"animation":0,"damageId":87}]},"skins_":[...]}}` | same, for visual data |
| `gameplay.json sessionUnits` | – | `true` | |
| `gameplay.json startPositionEnv` | – | `"WarSelection/mapeditor/startposition"` | |
| `visual.json buffs` | – | `[[137,{"emittersGroup":"WarSelection/effects/billboards/smoke/fogwws"}]]` | Visual effect per buff research |
| `visual.json scene`, `ann`, `searcherChunkSizeRemembered` | – | | engine/visual settings |
| `main.json ui` | – | `{"styles":"/Projects/WarSelection/styles.json"}` | |

## 5. Changed shape / type

| Path | Before | Now |
|---|---|---|
| `deathability.armor_` | `{ "type": int, "data": [ {object, probability} ] }` | `{ "zonal": [ {object, probability} ], "typed": { damageType: multiplier } }` |
| `ability.abilities[].data.clearTasks` (23 units) | String | Boolean (`false`) |
| `gameplay.json upgradesScripts` | `{ "path": "...", "list": [ {"crc", "file"} ] }` | `{ "list": [ "unit/moveSpeed.lua", ... ] }` (no path; files are under `scripts/gameplay/upgrades/`) |
| All references in section 2 | int | path string |
| `damage.area` in abilities | 0/1/2 | new value `4` (37 units, see 7) |

## 6. Replaced mechanics

**Script abilities (ability type 7) are gone.** In the old export 5 units had them; now no unit has type 7:

| Unit (gameId) | Old export | Now |
|---|---|---|
| 352 4/chn/soldier | type 7 "useWeapon": weapon 3, single, tags | `visual.externalData.weaponAbility` → weapon 3 (button with icon `tempAbility0`, name `<*unitAbility0/…>`) |
| 360 5/ja/battleship | type 7 "useWeapon": weapon 0 | `weaponAbility` → weapon 0 (`tempAbility1`) |
| 361 5/ja/bomber | type 7 "useWeapon": weapon 1, ground | `weaponAbility` → weapon 1; its create-unit (Ohka) ability is a normal work ability |
| 444 4/it/airplane_bomber | type 7 "paratroopers": 7 × unit 450 | Plain create-unit ability (type 0, count 7) with **no work entry**, triggered by `weapons[1].abilities=[0]`; button = `weaponAbility` (`tempAbility2`) |
| 448 4/it/airplane_bomber_heavy | same, unit 451 | same |

Also new: **4/pl/saboteur** – previously a work ability "create unit 377 (Suspicious bag)" with a 70 s reserve;
now abilities `[create bag, type 8 push]` triggered by `weapons[0].abilities=[0,1]`, no work entry, plus a `weaponAbility` button.

So the old `reserve` cooldowns (e.g. 120 s for the Ca.3 paratroopers) no longer exist for these units – the cooldown is presumably
the weapon's `rechargePeriod`.

The `weaponAbility` texts are in a localization folder the exporter never read:
`Content/interfaces/WarSelection/session/localization/*.loc` (was `Projects/WarSelection/interfaces/...` before engine 252) (`<*unitAbility0>Dynamite to the Heart|Use your bomb…`, 4 keys).
Icons: `Content/ui/WarSelection/icons/units/4/shared` atlas, images `tempAbility0..2.png`.

## 7. New / changed values

**Ability types** (`ability.abilities[].type`, absent = 0) – exporter enum: 0 createUnit, 1 research, 2 transform, 3 createEnv, 4 selfBuff, 6 damage, 7 script; 5 and 8 commented out as unknown:

| Type | Units | Notes |
|---|---|---|
| 5 | 42 (1/king, 1/worker, infantry of 3–5 ages) | `{"duration":10000}` – unsupported before too (silently dropped) |
| 8 | 35 (tanks, 4/pl/saboteur, elephants) | `{displacement, moveDistance, radius, tags}` – push/crush units around; **elephants: new use with `ally/enemy/buff`** (Panic) |
| 7 | 0 | was 5 – see section 6 |

**Damage area types** – exporter enum: 0 single, 1 area, 2 frontal:
- value `4` is new: 37 units, all in *abilities* (tank crush damage `{"area":4,"damages":[[0,0],[24,150000]]}`).
  In the old export these same abilities were `damageAreaFrontal`. With the current enum they become `N/A`.

**Damage types / typed armor** (new): only damage type `1` exists; only multiplier `1 → 0.4` on 175 buildings.

**Researches**: 156 (was 149). New ids **149–155** – none of them is in the `researches.*Researches` config lists, so they get type "other":
149 Radar Guidance, 150 Medical Aid, 151 Forced March, 152 Fleet Repairs, 153 Radio Interference, 154 Steel scythe,
155 Panic (no description; elephants' debuff, used via ability buff, not researchable).

**Upgrade programs**: 44 scripts; new since the old export: `unit/weapon/setDamageArea.lua`, `build/requirementsResearchClear.lua`,
`build/requirementsUnitClear.lua`, `unit/viewRange.lua`, `unit/controllable.lua`.

**`visual.json researches`** contains visual-only upgrades (e.g. program `setSkinObject.lua`, unit as path).

**Unit tags**: bits 0–35 used, 38 tag names. Damage tags 27–30 are used only by horde units against the four shards.

**Unit names**: 42 English names changed (translation fixes, e.g. 51 Guildhall → Town hall, 186/187/189 Palisade → Wall,
179 Squadron cannon → Divisional cannon, 401 Fighter He 51 → Attack aircraft He 51, 444/448 paratroopers' target 450 Solder → Soldier paratrooper).

**Units**: 453 (same set as before, no unit added or removed). **Envs**: 224 packs (legacy list has 459, 235 retired).

## 8. Fields no longer present in the data

| Model.field | Was used by exporter? |
|---|---|
| `ArmorJsonModel.data`, `.type` | yes → now `zonal` (`type` was unused) |
| `CreateEnvJsonModel.tag` | yes (create-env ability looked up env by `createTag`) → now `env` path |
| `AbilityDataJsonModel.parameters` | yes – script abilities (paratroopers / useWeapon), see 6 |
| `AbilityDataJsonModel.damagesCount` | yes (always 1 in old export) |
| `AbilityDataJsonModel.ang`, `.fallingDamage`, `.enoughDistance` | no |
| `AbilityWrapperJsonModel.rally` | no |
| `AttackJsonModel.weaponUseOnDeath` | yes (suicide weapon type) – no unit had it in the old export either; on-death effects are `ability.abilityOnDeath` (6 units) |
| `MovementJsonModel.weight` | exported as `unit.weight` – was already null for all units |
| `MovementJsonModel.radius` | no |
| `DamageJsonModel.id` | no (visual `damageId` still exists) |
| `ZoneEventJsonModel.envSearchDistance`, `.size_` | `envSearchDistance` exported (was 10000 everywhere) → now always null |
| `ProjectileJsonModel.finishOnGroundCollision`, `.homingAngle` | no (`homingAng` still exists) |
| `ExternalDataModel.customAbility` | no → see `weaponAbility` |
| `UpgradesScriptsJsonModel.path`, `UpgradeScriptJsonModel.crc/.file` | path + file built `programFile` |
| `ScenesJsonModel.units/envs/projectiles` | → packs |
| `visual.json`: `unitTypes`, `unitSkins`, `envTypes`, `envSkins`, `projectileTypes`, `buildPlans`, `mapEditor`, `attackDistance`, `upgradesScripts`, `searcherChunkSizeFlashbacks` | `unitTypes` → packs |
| `main.json`: `globalContent`, `visualSessionContent`, `ann`, `appearancesExceptions`, `contentExceptions`, `render`, `scripts`, `visual` | `globalContent`/`visualSessionContent` = all icons → KTX2 |

## 9. Localization

- `localization/*.loc` no longer has real unit names (only placeholders `<*unitName453>unit`…); names/texts come from packs.
  The exporter now injects pack entries as `<*unitName<id>>` / `<*unitText<id>>` / `<*envName<id>>` so the site keys are unchanged.
- Env names: `scripts/common/envNames.lua` → `localizedEnvNames()` maps env **path** → shared key (`<*envNameTree>`, `<*envNameMeat>`)
  or `false` = use the env's own `envName{id}` from its pack. Before: `envNames` table indexed by int env id in `onProjectLoad`.
- `onProjectLoad.lua`: tag/resource name tables are now fields of a `data` table (editor mode block); `projectileNames` is gone.
- Additional `.loc` folders per interface (`interfaces/*/localization`, 30 folders) – e.g. `unitAbility*` for weapon abilities,
  `envWorkText*`, hot key names.

## 10. Scripts with gameplay meaning

| Script | Content | Before |
|---|---|---|
| `scripts/common/cultures.lua` | `nationNames` (22 nations), **`nationsByAddress`** (unit path → nation id), `culturesAbilities`, **`vehicleTag = 13`** ("Vehicles" tag splits infantry/vehicles in unit lists) | `unitNations` indexed by int id |
| `CommonScripts/interface/WarSelection/researchIcons.lua` | `assets`: research id → icon (`WarSelection/icons/units/1/shared#upgrade0.png`), 201 entries | icons named `upgradeN` in `main.json` |
| `CommonScripts/interface/{unitIcons,envIcons,findImage}.lua` | icons resolved by engine (`f_getUnitIcon(id)`) | |
| `Content/interfaces/WarSelection/session/scripts/_init.lua` (engine 252 moved all interfaces from `Projects/WarSelection/interfaces/`) | `ageNames`, `hideResearchOnFinalAge`, `transformationNumber`, `workEnvCreateData` (env paths) | |

## 11. Not diffable (typed `Object` in the old models)

These could have changed internally without being detected:
`unit.gameplay`: `attack.agro`, `aura`, `paths`, `passability`, `deathability.attackReaction`, `deathability.corpses`,
`movement.holdPassability/idlePassability/randomMove`, `directionAttacks.container[]`, `turrets[].aimer`, `abilities[].requiredPassability`;
`unit.visual`: `attack`, `corpses`, `emitters`, `gather`, `healthBar`, `occlusion`, `reflection`, `selectionPriority`, `selectionType`, `shadow`, `skins_`,
`externalData.work`, `externalData.disableMindButton`; env `corpses`, `passability`; projectile `passability`;
`gameplay.json`: `auras`, `collisionSolver`, `springs`, `scripts`, `scenes.layers`, `build[].wallData`; most of `visual.json` / `main.json`.

## 12. Where the exporter currently maps new data to old semantics (decisions needed)

| Place | Current behaviour | Open question |
|---|---|---|
| Armor | exported: `armorZonal` (renamed from `armor`), `armorTyped` `[{type, probability}]` like `armorZonal` (type = damage type localization key from `Constants.DAMAGE_TYPE_NAMES`, only `1` → `damageTypeRanged` so far, unmapped types as their number; probability = game value / 65535 in whole percent, e.g. `[{"type": "damageTypeRanged", "probability": 40}]`), weapon/turret `damage.damageType` (number) | UI: `armor` → `armorZonal` in `CommonTable/index.jsx` and `useResearches.js` (armor research programs); render `armorTyped` and `damageType` |
| Weapon-triggered abilities (444, 448, saboteur) | shown as work abilities with zero cost and no cooldown | new container "weapon ability" linked to the weapon (+ `weaponAbility` button: icon, name, ground/single)? |
| `externalData.weaponAbility` (6 units) | ignored (only parsed so `groundAttack` is not lost) | export as weapon ability info (needs `interfaces/session/localization`) |
| Ability types 5, 8 | dropped (as before) | 8 now carries elephant Panic buff (`ally/enemy/buff.duration`) |
| Damage area 4 | → `N/A` | name it (was "frontal" for the same abilities) |
| Researches 149–155 | type "other" | assign groups in `config/exporter.properties` |
| `speedReverse_` | exported as `movement.speedReverse` (same scale as `speed`, absent if the unit can't reverse) | – |
| `elevation`, `rotationAccel`, `turnPivot`, `priorityMult`, `anyAction` | read, not exported | which are worth showing |
| `unitOverrides` | applied to the unit before building the model | – |
| Unit nation | from `nationsByAddress` by path | – |
| `vehicleTag` | not read | use for infantry/vehicle grouping? |
