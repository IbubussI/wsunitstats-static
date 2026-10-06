# WS Unit Stats UI

React + TypeScript site (Vite, MUI, Chart.js, zustand, i18next) that shows the data exported by `com.wsunitstats.exporter`.

## Data

The app reads static files from `public/files` (not in git): copy the exporter output folder `files` there.
Site labels are in `public/static/localization/{en,ru}.json`, game texts come from `public/files/localization`.

## Scripts

- `npm start` - dev server on http://localhost:3000
- `npm run typecheck` - TypeScript check
- `npm run build` - type check and production build into `../output`

## Structure

- `src/router.tsx` - routes and data loaders; `src/Root.tsx` - page layout
- `src/store` - zustand stores (game context, theme)
- `src/types/game.ts` - types of the exported data
- `src/components` - shared components (`common`, `layout`, `Header`, `Footer`, `TimeLineChart`)
- `src/pages` - pages; unit tabs are in `pages/UnitPage`
- `src/utils/researches.ts` - applies research upgrades to a unit

Unit ids are paths (`WarSelection/1/slinger`), so a unit url is `/<locale>/unit/<id>/<tab>`.

Some modules stay in JavaScript (`allowJs`), as typing them adds little: chart.js extensions (`chartJsInit.js`,
`TimeLineChart/*.js[x]`), the replay parser and its data structures, the replay chart box/units list and the modding tree.
