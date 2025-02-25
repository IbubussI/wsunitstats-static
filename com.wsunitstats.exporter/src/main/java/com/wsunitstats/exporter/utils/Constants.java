package com.wsunitstats.exporter.utils;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class Constants {
    private Constants() {
        // Utility class
    }

    public static final Pattern LOCALIZATION_KEY_PATTERN = Pattern.compile("<\\*[a-zA-Z0-9/]+>");
    public static final Pattern LOCALIZATION_PATTERN = Pattern.compile("^\\{?localize\\(\"(<\\*[a-zA-Z0-9/]+>)\"\\)}?$", Pattern.MULTILINE);
    public static final Pattern LOCALIZATION_MAP_ENTRY_PATTERN = Pattern.compile("^\\[(\\d*)]=localize\\(\"(<\\*[a-zA-Z0-9/]+>)\"\\)$", Pattern.MULTILINE);
    public static final double TICK_TIME = 50d;
    public static final double SHIFT_VALUE_MULTIPLIER = 1000d;
    public static final double PROJECTILE_SPEED_VALUE_MULTIPLIER = 1_000_000d;
    public static final double PERCENT_VALUE_MULTIPLIER = 10d;
    public static final double POPULATION_VALUE_MULTIPLIER = 10d;
    public static final int LONG_SIZE = 64;
    public static final int LIVESTOCK_LIMIT = 50;
    public static final List<Integer> LIVESTOCK_IDS = List.of(62, 130);
    public static final double INIT_HEALTH_MODIFIER = 1.5; // calculated by experiment
    public static final double BUILD_SPEED_MODIFIER = 0.238095; // calculated by experiment
    public static final int ACTIVE_RESOURCES = 3;
    public static final double DEFAULT_GATHER_FIND_TARGET_DISTANCE = 100d;
    public static final double DEFAULT_GATHER_FIND_STORAGE_DISTANCE = 16640d;
    public static final double STORAGE_MULTIPLIER_MODIFIER = 100d / 65536d;
    public static final double STORAGE_MULTIPLIER_DEFAULT = 65536d;

    private static final String UNDEF = "N/A";

    public static final String LOCALIZATION_MULTI_VALUE_DELIMITER_REGEX = "\\|";
    public static final String SLASH = "/";
    public static final String LOCALIZATION_INDEX_DELIMITER = SLASH;
    public static final String FILE_PATH_DELIMITER = SLASH;
    public static final String CLOSING_ANGLE_BRACKET = ">";

    public static final String BASIC_DAMAGE_TYPE = "damageTypeBase";
    public static final String GENERIC_UNIT_TAG = "genericUnitTag";
    public static final String NIL = "nil";
    public static final String JSON_EXTENSION = ".json";

    public static final List<Integer> WALL_UNITS = Arrays.asList(
            182, 183, 184, 185, 186, 187, 188, 189,
            211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230,
            232, 375
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
        PARATROOPER(7, "abilityParatrooper");

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
        FOOD(0, 579),
        WOOD(1, 580),
        METAL(2, 584),
        GOLD(3, 581),
        FUEL(4, 582);

        private final int gameId;
        private final int imageId;

        ResourceIcon(int gameId, int imageId) {
            this.gameId = gameId;
            this.imageId = imageId;
        }

        public int getGameId() {
            return gameId;
        }

        public int getImageId() {
            return imageId;
        }

        public static ResourceIcon getByGameId(int gameId) {
            for (ResourceIcon resourceIconMappings : ResourceIcon.values()) {
                if (resourceIconMappings.getGameId() == gameId) {
                    return resourceIconMappings;
                }
            }
            throw new IllegalArgumentException("Resource icon not found for gameId:" + gameId);
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

    public enum UnitCategory {
        WORKER("unitCategoryWorker"),
        LAND("unitCategoryLand"),
        AIR("unitCategoryAir"),
        FLEET("unitCategoryFleet"),
        PRODUCTION_BUILDING("unitCategoryProdBuild"),
        DEFENCE_BUILDING("unitCategoryDefBuild"),
        ECO_BUILDING("unitCategoryEcoBuild"),
        GAMEPLAY_BUILDING("unitCategoryGameplayBuild"),
        OTHER("unitCategoryOther");

        private final String name;

        UnitCategory(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }
}
