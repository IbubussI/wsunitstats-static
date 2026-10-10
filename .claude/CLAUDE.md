# WS Unit Stats

Site with War Selection game data (https://wsunitstats.com): units, researches, modding docs (engine data tree), replay analysis.
Two modules: a Java exporter that reads the game files and writes JSON/PNG, and a React UI that renders those files.
`GAME_DATA_CHANGES.md` describes the move of the game to content packs and path ids (engine 251/252): read it before
touching the game file reading.

## Layout

| Path | What |
|---|---|
| `com.wsunitstats.exporter` | Spring Boot CLI (Java 21, Maven, Lombok). Reads the game files, runs export tasks |
| `config/exporter.properties` | Run config: tasks, output paths, engine dump inputs, research groups. Overrides the jar's `src/main/resources/exporter.properties` (game file paths) |
| `input/gameplay.json`, `input/visual.json` | Engine data dumps for the docs page (made by a mod: `log(toJson(toTable(root)))`, taken from the game log) |
| `output/` | Exporter output (`output/files`) and the UI production build (`vite build` writes to `../output`, not cleaned). Not in git |
| `entities.json` | `writeFile` task output (all units/researches, localized), handy for diffing two game versions. Not in git |
| `com.wsunitstats.ui` | React + TypeScript (Vite, MUI, i18next, zustand). See its `README.md` |
| `com.wsunitstats.ui/public/files` | Copy of `output/files` the dev server reads. Not in git |
| `com.wsunitstats.ui/public/static` | Site assets in git: `localization/{en,ru}.json` (site labels), `legacyIds.json`, wonder icons |

## Build and run

- Exporter: only JDK 21 is installed, `mvn` is not on PATH (IntelliJ's bundled one):
  `JAVA_HOME="/c/Program Files/Java/jdk-21.0.12" "/c/Program Files/JetBrains/IntelliJ IDEA 2026.2.1/plugins/maven-plugin/lib/maven3/bin/mvn" -q -pl com.wsunitstats.exporter -am package -DskipTests`
  → `com.wsunitstats.exporter/target/com.wsunitstats.exporter.jar`.
- Run from a folder that has `config/` and `input/` (the repo root works): `java -jar com.wsunitstats.exporter.jar [--tasks=a,b]`.
  The game folder is found through the Steam registry (`warselection.dir = autodetect`, app id 1022450);
  files are read from `<game>/Cache`. A run takes under a minute; it ends with `Total: N, completed: N, error: 0`.
- Data flow: exporter → `output/files` → copy into `com.wsunitstats.ui/public/files` → `npm start` (dev, port 3000)
  or `npm run build` (type check + build into `../output`).
- UI check: `npx tsc --noEmit -p .` in `com.wsunitstats.ui`.
- Replays come from `https://games-api.warselect.io`; to test the replay pages with a fixed replay, intercept that host
  (e.g. Chrome DevTools protocol `Fetch.enable`) instead of changing the code.

## Export tasks

`exportUnits`, `exportResearches`, `exportLocalization`, `exportImages`, `exportUnitSelector`, `exportResearchSelector`,
`exportContext` → `output/files/{units,researches,localization,images,context.json}`; `exportEngineData` → `output/files/docs/tree`
(docs page); `writeFile` → `entities.json`; `writeExcelSpecial`, `writeExcelCosts`, `writeBuildIdsSpecial` → special reports.

The dumps are single log lines of tens of MB in `<game>/gen/log.txt` (rewritten on every game launch, so extract them before
restarting the game); the gameplay one starts with `{"auraTypes"`, the visual one with `{"bugReport"`:
`grep -a '^[0-9-]* [0-9:]* {"auraTypes"' "$LOG" | tail -n 1 | sed -E 's/^[0-9-]+ [0-9:]+ //' | tr -d '\r' > input/gameplay.json`
(same with `bugReport` → `input/visual.json`). The `interface` part of the visual dump depends on which interfaces were open.

Engine data (`exportEngineData`, `EngineDataBuilder`): every value of the dumps is a tree node `{k, v?, tp, ex?, as?, ch?}` holding
only its key; the UI builds paths from the keys (`[n]` for keys starting with a digit) and derives all node details
(`DocsPage/engineTree.ts`). Subtrees of 32+ values equal to an earlier one become `link` nodes with the path of the first one.
Children of large subtrees are in separate files named by the dot path of the node.

## Game files the exporter reads

All relative to `<game>/Cache`, configured in `com.wsunitstats.exporter/src/main/resources/exporter.properties`:

| File | Used for |
|---|---|
| `Content/units/WarSelection/**.pack`, `Content/envs/...`, `Content/projectiles/...` | GEMPACK packs: `unit.json` / `env.json` / `projectile.json` (`gameplay`, `visual`, `localization`, `version`) + `icon.ktx2` |
| `Projects/WarSelection/gameplay.json` | researches, upgrades, upgrade scripts list, build list, `scenes.unitOverrides` (patches over unit packs), `version` |
| `Projects/WarSelection/visual.json` | `unitOverrides` (patches over the visual part of unit packs) |
| `Projects/WarSelection/main.json` | `version` |
| `../engine-version.txt` (game root) | engine version. Game version shown on the site = `<engine>.<gameplay version>_<main version>`, e.g. `252.4009_29231` |
| `Projects/WarSelection/localization/*.loc` | game texts (`<*key>value|part2`) |
| `Projects/WarSelection/scripts/main/onProjectLoad.lua` | tables `unitTagNames`, `unitSearchTagNames`, `envTagNames`, `envSearchTagNames`, `resourceNames` |
| `Projects/WarSelection/scripts/common/cultures.lua` | `nationNames`, `nationsByAddress` (unit path → nation id) |
| `Projects/WarSelection/scripts/common/envNames.lua` | env path → shared name key (`tags` table) |
| `CommonScripts/interface/WarSelection/researchIcons.lua` | `assets`: research id → icon asset |
| `Content/interfaces/WarSelection/session/scripts/_init.lua` | `ageNames` |
| `Content/interfaces/WarSelection/session/scripts/_start.lua` | `setCanDance({...})` calls: units that can dance (source Lua only) |
| `Content/ui/**` | UI atlases (`.ktx2` + `.json`) for icons referenced as `atlas#image` |

Lua tables are read from source (`LuaSourceReader`) or from compiled bytecode (`LuaBytecodeReader`); the dance units
are found by a text pattern, so they are unknown (warning only) if `_start.lua` is compiled.

## Game update checklist

Run the exporter first: it fails with `Game files contain properties unknown to the models` and lists them when the game adds
fields (models live in `model/json`). Then diff `entities.json` and `context.json` against the previous export, and check the
places below. Unit references are paths like `WarSelection/4/de/pillbox/heavy`; they break silently if a unit is renamed or moved.

### Exporter config (`config/exporter.properties`)

- `researches.*Researches`: research ids by group (age transition, eco, pop, territory, combat, unit, buff, aura,
  wonder transition). New research ids fall into "other" until added. Research ids are indexes in `gameplay.json researches.list`.

### Exporter code

| Place | Hardcoded |
|---|---|
| `utils/Constants.java` | `LIVESTOCK_LIMIT` (50, checked in game), `LIVESTOCK_SUPPLY_INDEX` (supply cost index 1 = livestock), `INIT_HEALTH_MODIFIER`, `BUILDING_PROGRESS_FULL` (2^23), `TICK_TIME` and value scales, `TYPED_ARMOR_MAX`, `DAMAGE_TYPE_NAMES` (damage type 1 → ranged), `WALL_UNITS` (wall unit paths), `GROUND_COMBAT_VEHICLE_EXTRA_UNITS` (Polish tankettes, no turret in the data), enums of ability types, ability container types, damage area types (0–2; 4 is unnamed), resource icon atlas assets |
| `service/impl/UnitCategoryServiceImpl.java` | category exception units (paths), unit tag ids used by the categories (see below), search tag ids (0–2 obtaining, 7 land capture, 9 next age); ground combat vehicle rule (turret + Equipment + Land forces + weapon damage to Land forces ≠ 0) |
| `service/impl/UnitValueCalculatorImpl.java` | kill value tuning: values by category and by nation id, cost exceptions by unit path (workers, fishers, tractor, immortal), TC/wonder costs |
| `service/impl/FileContentServiceImpl.java` | pack entry names, localization key prefixes (`<*unitName`, `<*unitText`, `<*upgrade`, `<*envName`) |
| `service/impl/FileReaderServiceImpl.java` | Lua table names listed in the table above, `setCanDance` call pattern |
| `service/impl/ModelTransformingServiceImpl.java` | `TICKS_PER_SECOND`, `ANGLE_MODIFIER`, default upgrade scripts path `gameplay/upgrades` |
| `utils/Utils.java` | cost value: food + wood + iron × 1.5; construction speed from building progress |
| `service/UnitSourceFinder.java` | how units are created/built/transformed (ability types), cheapest route search |

### UI code (`com.wsunitstats.ui/src`)

| Place | Hardcoded |
|---|---|
| `utils/constants.ts` | `STONE_AGE_UNIT_ID` (stone age town hall), engine scales (`TICK_RATE`, `ENGINE_FLOAT_SHIFT`, `ENGINE_STORAGE_MULTIPLIER`), ability type ids, file paths |
| `utils/researches.ts` | `UPGRADE_SCRIPTS`: upgrade program id (index in `gameplay.json upgradesScripts.list`) → JS port of the Lua script; value scales (`BUILD_SPEED_SCALE` = 2^23 / (20 × 100)). New or reordered scripts change the ids |
| `pages/ReplaysPage/ReplayInfo/replayInfoParser.js` | replay `extraData` layout: `0` match, `1` players lost, `2` timeline (per period: units created, killed, land, workers [points, workers, boats, tractors], resources [delta×3, collected×3, now×3]), `3` stats, `4` researches, `6` kills, `7` unit index → path (absent in legacy replays → `public/static/legacyIds.json`); timeline period 30 s; faction/team colors; research types `researchTypeAgeTransition` / `researchTypeWonderTransition` |
| `pages/ReplaysPage/ReplayInfo/ageNationFinder.ts` | research ids of every age/nation transition (port of a game mod script) |
| `pages/ReplaysPage/ReplayInfo/gatherEfficiencyLookupTable.js` | gather speeds and warehouse efficiency by age/nation (MVP score) |
| `pages/ReplaysPage/ReplayInfo/scoreCalculator.js` | `MVP_CONST` tuning |
| `pages/ReplaysPage/ReplayInfo/Awards/index.tsx` | award rules: unit tag ids, unit paths (university, airfield and carriers, stone age prefix), `advancedCategory` names (`build-def`, `wall`, `mine`, `worker`), icon image paths, thresholds |
| `pages/ReplaysPage/StatsTable`, `components/TimeLineChart/chartIconResolver.ts` | resource images `resource/0..2.png`, dataset container names |
| `public/static/legacyIds.json` | snapshot of the game's `Projects/WarSelection/legacyIds.json` for replays recorded before path ids |

### Unit tag ids used in code

From `onProjectLoad.lua unitTagNames` (`<*unitTag#N>`): 2 Building, 3 Worker, 4 Army, 5 Main building (TC), 9 Wonder,
13 Equipment, 14 Aviation, 15 Land forces, 16 Fleet, 25 Horseman (any mount), 32 Large Land Collider (not moved aside
by tanks, "large units" in `UnitPage/AbilityIcons.tsx`), 34 Heavy vehicle, 35 Horse.
If the tag list changes, check `UnitCategoryServiceImpl`, `Awards/index.tsx`, `AbilityIcons.tsx` and the tag filters of the unit selector.

### Values found by testing in game

`LIVESTOCK_LIMIT` (50), construction speed formula (from `scripts/common/sessionSelection.lua`), research effects
ported to `utils/researches.ts`. Re-check them when the game changes these mechanics.
