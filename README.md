# WS Unit Stats

A project designed to provide some basic tools to observe different War Selection game data. Live page: https://wsunitstats.com

## Features
Current main features:
- unit list
- unit stats (general and some of more technical)
- ability to apply researches to unit stats
- researches list
- modding facilities: ability to navigate through in-game engine data structure

## Exporter module

Exporter is a Java Spring Application module [com.wsunitstats.exporter](com.wsunitstats.exporter) that is used to collect the data from the game files.
This data required to render site the pages. Exporter has a set of export tasks that produce different 
data depending on the final goal. Default task configuration is stored under [exporter.properties](config%2Fexporter.properties)
List of current tasks available:
- writeFile - writes the unit/researches stats to file (.json file)
- writeExcelSpecial - writes the unit stats to Excel file (.xlsx file)
- writeBuildIdsSpecial - writes "build id -> unit name, id, nation" entries in the file (.txt file)
- exportUnits - writes unit stats for website assets in the output folder (.json files)
- exportResearches - writes research stats for website assets in the output folder (.json files)
- exportLocalization - writes game localization key-values for website assets in the output folder (.json files)
- exportUnitSelector - writes data required to render research selectors for website assets in the output folder (.json files)
- exportImages - writes images data for website assets in the output folder (.png files)
- exportEngineData - writes engine data (taken from the json files dumped by the mod) for website assets in the output folder (.json files)
- exportContext - writes context data (unit list, research list, locale options etc) for website assets in the output folder (.json files)

Exporter automatically locates the game files searching for them in the Steam's Windows Registry data. This can be disabled in the configs, however.

For exportEngineData task two files inside _input_ folder are used. These files are taken from game logs after execution of special mod that dumps the entire engine data tree to json and logs it (`log(toJson(toTable(root)))`).

### How to build and run exporter module

To build exporter Java 17 and Maven required

Build:
- Download sources
- Go to root project folder
- Run `mvn clean install`
- The result will be a jar file located at **com.wsunitstats.exporter/target/com.wsunitstats.exporter.jar**

Run:
- Copy the **com.wsunitstats.exporter.jar** and **[config](config)** directory to any folder
- Go to that folder and run `java -jar com.wsunitstats.exporter.jar`
- Wait until execution completed (in case of errors in any tasks there will be error counter more than 0 at the end)
- To run specific tasks instead of default use `--tasks` CLI argument: `java -jar com.wsunitstats.exporter.jar --tasks=writeFile,exportImages`
- Result can be found either in root or **output** folder depending on a task

## UI module

UI is React module that is used to provide web experience for the project. Located under [com.wsunitstats.ui](com.wsunitstats.ui) directory.

Application uses Google Material UI components in a mix with custom ones. React Router is used as navigation provider.

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
