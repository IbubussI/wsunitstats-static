package com.wsunitstats.exporter.utils;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public class Constants {
    private Constants() {
        // Utility class
    }

    /**
     * Localization key; keys of entities include entity ids, which may be paths (e.g. "<*unitNameWarSelection/3/ae/asigaru-yari>"),
     * keys of parts of multipart entries include the part index (e.g. "<*upgrade12#0>")
     */
    public static final Pattern LOCALIZATION_KEY_PATTERN = Pattern.compile("<\\*[a-zA-Z0-9/_.\\-]+(#[0-9]+)?>");
    public static final double TICK_TIME = 50d;
    public static final double SHIFT_VALUE_MULTIPLIER = 1000d;
    public static final double PROJECTILE_SPEED_VALUE_MULTIPLIER = 1_000_000d;
    public static final double PERCENT_VALUE_MULTIPLIER = 10d;
    public static final double POPULATION_VALUE_MULTIPLIER = 10d;
    public static final int LONG_SIZE = 64;
    public static final int LIVESTOCK_LIMIT = 50;
    /** References to the livestock units, resolved by the unit provider */
    public static final List<String> LIVESTOCK_UNITS = List.of(
            "WarSelection/animals/goose", // domestic fowl
            "WarSelection/animals/goat/female"
    );
    public static final double INIT_HEALTH_MODIFIER = 1.5; // calculated by experiment
    public static final double BUILD_SPEED_MODIFIER = 0.238095; // calculated by experiment
    public static final int ACTIVE_RESOURCES = 3;
    public static final double DEFAULT_GATHER_FIND_TARGET_DISTANCE = 100d;
    public static final double DEFAULT_GATHER_FIND_STORAGE_DISTANCE = 16640d;
    public static final double STORAGE_MULTIPLIER_MODIFIER = 100d / 65536d;
    public static final double STORAGE_MULTIPLIER_DEFAULT = 65536d;
    public static final int MOVEMENT_SPEED_MODIFIER = 16;
    /** Typed armor multiplier of 1.0 in the game files */
    public static final double TYPED_ARMOR_MAX = 65535d;

    private static final String UNDEF = "N/A";

    public static final String LOCALIZATION_MULTI_VALUE_DELIMITER_REGEX = "\\|";
    public static final String SLASH = "/";
    /**
     * Separates a localization key from the index of a part of a multipart entry (e.g. "<*upgrade12#0>").
     * The game uses "/" for that, which the exporter can't: "/" also separates segments of entity paths in keys.
     */
    public static final String LOCALIZATION_INDEX_DELIMITER = "#";
    public static final String FILE_PATH_DELIMITER = SLASH;
    public static final String CLOSING_ANGLE_BRACKET = ">";

    public static final String BASIC_DAMAGE_TYPE = "damageTypeBase";
    /** Localization keys of damage types (weapon damage type, typed armor); unmapped types are exported as their number */
    public static final Map<Integer, String> DAMAGE_TYPE_NAMES = Map.of(
            1, "damageTypeRanged"
    );
    public static final String GENERIC_UNIT_TAG = "genericUnitTag";
    public static final String NIL = "nil";
    public static final String JSON_EXTENSION = ".json";

    /** References to the wall units, resolved by the unit provider */
    public static final List<String> WALL_UNITS = List.of(
            "WarSelection/2/e/wall_big", "WarSelection/2/e/wall_medium", "WarSelection/2/e/wall_tower",
            "WarSelection/2/e/wall_gate_close", "WarSelection/2/e/wall_gate_open",
            "WarSelection/2/a/wall_big", "WarSelection/2/a/wall_medium", "WarSelection/2/a/wall_tower",
            "WarSelection/2/a/wall_gate_close", "WarSelection/2/a/wall_gate_open",
            "WarSelection/3/ew/wall_big", "WarSelection/3/ew/wall_medium", "WarSelection/3/ew/wall_tower",
            "WarSelection/3/ew/wall_gate_close", "WarSelection/3/ew/wall_gate_open",
            "WarSelection/3/ee/wall_big", "WarSelection/3/ee/wall_medium", "WarSelection/3/ee/wall_tower",
            "WarSelection/3/ee/wall_gate_close", "WarSelection/3/ee/wall_gate_open",
            "WarSelection/3/aw/wall_big", "WarSelection/3/aw/wall_medium", "WarSelection/3/aw/wall_tower",
            "WarSelection/3/aw/wall_gate_close", "WarSelection/3/aw/wall_gate_open",
            "WarSelection/3/ae/wall_big", "WarSelection/3/ae/wall_medium", "WarSelection/3/ae/wall_tower",
            "WarSelection/3/ae/wall_gate_close", "WarSelection/3/ae/wall_gate_open",
            "WarSelection/4/wall", // antitank hedgehog
            "WarSelection/4/pl/wall" // dragon's teeth
    );

    public enum TagGroupName {
        UNIT_SEARCH_TAGS("tagGroupUnitSearch"),
        UNIT_TAGS("tagGroupUnit"),
        ENV_SEARCH_TAGS("tagGroupEnvSearch");

        private final String groupName;

        TagGroupName(String groupName) {
            this.groupName = groupName;
        }

        public String getGroupName() {
            return groupName;
        }
    }

    public enum AbilityType {
        UNDEFINED(-1, UNDEF),
        CREATE_UNIT(0, "abilityCreateUnit"),
        RESEARCH(1, "abilityResearch"),
        TRANSFORM(2, "abilityTransform"),
        CREATE_ENV(3, "abilityCreateEnv"),
        SELF_BUFF(4, "abilitySelfBuff"),
        //SELF_STUN(5, "abilityDance"),
        DAMAGE(6, "abilityDamage"),
        SCRIPT(7, "abilityScript");
        //SEARCH_UNITS_CIRCLE(8, ""); - need to clarify what is it responsible for

        private final int type;
        private final String name;

        AbilityType(int type, String name) {
            this.type = type;
            this.name = name;
        }

        public int getType() {
            return type;
        }

        public String getName() {
            return name;
        }

        public static AbilityType get(int type) {
            for (AbilityType abilityType : AbilityType.values()) {
                if (abilityType.getType() == type) {
                    return abilityType;
                }
            }
            return UNDEFINED;
        }
    }

    public enum AbilityContainerType {
        UNDEFINED(-1, UNDEF),
        ACTION(0, "abilityContainerAction"),
        WORK(1, "abilityContainerWork"),
        ZONE_EVENT(2, "abilityContainerZone"),
        DEATH(3, "abilityContainerDeath");

        private final int type;
        private final String name;

        AbilityContainerType(int type, String name) {
            this.type = type;
            this.name = name;
        }

        public int getType() {
            return type;
        }

        public String getName() {
            return name;
        }

        public static AbilityContainerType get(int type) {
            for (AbilityContainerType abilityType : AbilityContainerType.values()) {
                if (abilityType.getType() == type) {
                    return abilityType;
                }
            }
            return UNDEFINED;
        }
    }

    public enum DamageAreaType {
        // can add (sessions/localization) file and replace this enum
        // with list of <*damageArea> keys in LocalizationKeyModel,
        // but adding the whole file just for 3 keys will cost extra localization json size
        UNDEFINED(-1, UNDEF),
        SINGLE(0, "damageAreaSingle"),
        AREA(1, "damageAreaArea"),
        FRONTAL(2, "damageAreaFrontal");

        private final int type;
        private final String name;

        DamageAreaType(int type, String name) {
            this.type = type;
            this.name = name;
        }

        public int getType() {
            return type;
        }

        public String getName() {
            return name;
        }

        public static DamageAreaType get(Integer type) {
            if (type == null) {
                return SINGLE;
            }
            for (DamageAreaType abilityType : DamageAreaType.values()) {
                if (abilityType.getType() == type) {
                    return abilityType;
                }
            }
            return UNDEFINED;
        }
    }

    public enum ResourceIcon {
        FOOD(0, "WarSelection/atlases/resources#1-res_meat.png"),
        WOOD(1, "WarSelection/atlases/resources#2-res_materials.png"),
        METAL(2, "WarSelection/atlases/resources#6-res_metall.png"),
        GOLD(3, "WarSelection/atlases/resources#3-res_gold.png"),
        FUEL(4, "WarSelection/atlases/resources#4-res_oil.png");

        private final int gameId;
        /** Interface image asset of the resource icon */
        private final String asset;

        ResourceIcon(int gameId, String asset) {
            this.gameId = gameId;
            this.asset = asset;
        }

        public int getGameId() {
            return gameId;
        }

        public String getAsset() {
            return asset;
        }
    }

    public enum WeaponType {
        TURRET("weaponTypeTurret"),
        RANGE("weaponTypeRange"),
        MELEE("weaponTypeMelee"),
        AERIAL_BOMB("weaponTypeAerialBomb"),
        SUICIDE("weaponTypeSuicide");

        private final String name;

        WeaponType(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    public enum EntityType {
        ENV("env"),
        UNIT("unit"),
        UPGRADE("upgrade"),
        RESOURCE("resource");

        private final String name;

        EntityType(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    public enum QuantityType {
        FROM_TO("quantityTypeFromTo"),
        NOT_MORE_THAN("quantityTypeNotMore"),
        NOT_LESS_THAN("quantityTypeNotLess");

        private final String name;

        QuantityType(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    public enum SimpleUnitCategory {
        WORKER("unitCategoryWorker"),
        LAND("unitCategoryLand"),
        AIR("unitCategoryAir"),
        FLEET("unitCategoryFleet"),
        TC("unitCategoryTC"),
        PRODUCTION_BUILDING("unitCategoryProdBuild"),
        DEFENCE_BUILDING("unitCategoryDefBuild"),
        ECO_BUILDING("unitCategoryEcoBuild"),
        GAMEPLAY_BUILDING("unitCategoryGameplayBuild"),
        OTHER("unitCategoryOther");

        private final String name;

        SimpleUnitCategory(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    public enum AdvancedUnitCategory {
        WORKER("worker"),
        LAND("land"),
        AIR("air"),
        FLEET("fleet"),
        WONDER("wonder"),
        TC("tc"),
        HOUSE("house"),
        MINE("mine"),
        WALL("wall"),
        PRODUCTION_BUILDING("build-prod"),
        DEFENCE_BUILDING("build-def"),
        ECO_BUILDING("build-eco"),
        SECONDARY_BUILDING("build-etc"),
        GAMEPLAY_BUILDING("build-gameplay"),
        OTHER("other");

        private final String name;

        AdvancedUnitCategory(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public static AdvancedUnitCategory fromName(String name) {
            for (AdvancedUnitCategory cat : AdvancedUnitCategory.values()) {
                if (cat.name.equals(name)) {
                    return cat;
                }
            }
            throw new IllegalArgumentException("AdvancedUnitCategory value not found for name: " + name);
        }
    }

    public enum ResearchType {
        AGE_TRANSITION("researchTypeAgeTransition"),
        ECO("researchTypeEco"),
        POP("researchTypePop"),
        TERRITORY("researchTypeTerritory"),
        COMBAT("researchTypeCombat"),
        UNIT("researchTypeUnit"),
        BUFF("researchTypeBuff"),
        WONDER_TRANSITION("researchTypeWonderTransition"),
        OTHER("researchTypeOther");

        private final String type;

        ResearchType(String type) {
            this.type = type;
        }

        public String getType() {
            return type;
        }
    }

    public enum UnitCostSourceType {
        ABILITY("unitCostSourceTypeAbility"),
        BUILDING("unitCostSourceTypeBuilding");

        private final String type;

        UnitCostSourceType(String type) {
            this.type = type;
        }

        public String getType() {
            return type;
        }
    }
}
