package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ArmorModel;
import com.wsunitstats.exporter.model.exported.submodel.TurretModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.DamageWrapperModel;
import com.wsunitstats.exporter.model.exported.submodel.weapon.WeaponModel;
import com.wsunitstats.exporter.service.LocalizationService;
import com.wsunitstats.exporter.service.ModelExporterService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.wsunitstats.exporter.utils.Constants.BASIC_DAMAGE_TYPE;

/**
 * Task to get any file with any content (for informational and test purposes)
 */
@Component
public class WriteExcelSpecialTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(WriteExcelSpecialTask.class);
    private static final String TASK_NAME = "writeExcelSpecial";
    private static final String FILENAME = "excel-units-output.xlsx";
    private static final String LOCALE = "en";
    private static final int COLUMNS_PER_WEAPON = 19;
    private static final int WEAPONS_MAX = 10;

    private static final List<String> DAMAGE_NAMES_LIST = List.of(
            BASIC_DAMAGE_TYPE, //base
            "<*unitTag/1>", //building
            "<*unitTag/14>", //land forces
            "<*unitTag/13>", //aviation
            "<*unitTag/19>", //underwater
            "<*unitTag/15>", //fleet
            "<*unitTag/5>", //repairable
            "<*unitTag/7>" //disassemblable
    );
    private static final List<String> COLUMNS = List.of(
            "Nation",
            "Name",
            "ID",
            "Health",
            "View Range",
            "Speed",
            "Rotation Speed",
            "Seats provide",
            "Seats take",
            "Pop provide",
            "Pop take",

            "Armor0",
            "Armor0%",
            "Armor1",
            "Armor1%",
            "Armor2",
            "Armor2%",
            "Armor3",
            "Armor3%",

            "W0 ID",
            "W0 Base Dmg",
            "W0 Building Dmg",
            "W0 Land Forces Dmg",
            "W0 Aviation Dmg",
            "W0 Underwater Dmg",
            "W0 Fleet Dmg",
            "W0 Repairable Dmg",
            "W0 Disassemblable Dmg",
            "W0 Reload",
            "W0 Spread",
            "W0 Area",
            "W0 Area Radius",
            "W0 Range Min",
            "W0 Range Max",
            "W0 Range Stop",
            "W0 Angle",
            "W0 Projectile Speed",
            "W0 Rotation Speed",

            "W1 ID",
            "W1 Base Dmg",
            "W1 Building Dmg",
            "W1 Land Forces Dmg",
            "W1 Aviation Dmg",
            "W1 Underwater Dmg",
            "W1 Fleet Dmg",
            "W1 Repairable Dmg",
            "W1 Disassemblable Dmg",
            "W1 Reload",
            "W1 Spread",
            "W1 Area",
            "W1 Area Radius",
            "W1 Range Min",
            "W1 Range Max",
            "W1 Range Stop",
            "W1 Angle",
            "W1 Projectile Speed",
            "W1 Rotation Speed",

            "W2 ID",
            "W2 Base Dmg",
            "W2 Building Dmg",
            "W2 Land Forces Dmg",
            "W2 Aviation Dmg",
            "W2 Underwater Dmg",
            "W2 Fleet Dmg",
            "W2 Repairable Dmg",
            "W2 Disassemblable Dmg",
            "W2 Reload",
            "W2 Spread",
            "W2 Area",
            "W2 Area Radius",
            "W2 Range Min",
            "W2 Range Max",
            "W2 Range Stop",
            "W2 Angle",
            "W2 Projectile Speed",
            "W2 Rotation Speed",

            "W3 ID",
            "W3 Base Dmg",
            "W3 Building Dmg",
            "W3 Land Forces Dmg",
            "W3 Aviation Dmg",
            "W3 Underwater Dmg",
            "W3 Fleet Dmg",
            "W3 Repairable Dmg",
            "W3 Disassemblable Dmg",
            "W3 Reload",
            "W3 Spread",
            "W3 Area",
            "W3 Area Radius",
            "W3 Range Min",
            "W3 Range Max",
            "W3 Range Stop",
            "W3 Angle",
            "W3 Projectile Speed",
            "W3 Rotation Speed",

            "W4 ID",
            "W4 Base Dmg",
            "W4 Building Dmg",
            "W4 Land Forces Dmg",
            "W4 Aviation Dmg",
            "W4 Underwater Dmg",
            "W4 Fleet Dmg",
            "W4 Repairable Dmg",
            "W4 Disassemblable Dmg",
            "W4 Reload",
            "W4 Spread",
            "W4 Area",
            "W4 Area Radius",
            "W4 Range Min",
            "W4 Range Max",
            "W4 Range Stop",
            "W4 Angle",
            "W4 Projectile Speed",
            "W4 Rotation Speed",

            "W5 ID",
            "W5 Base Dmg",
            "W5 Building Dmg",
            "W5 Land Forces Dmg",
            "W5 Aviation Dmg",
            "W5 Underwater Dmg",
            "W5 Fleet Dmg",
            "W5 Repairable Dmg",
            "W5 Disassemblable Dmg",
            "W5 Reload",
            "W5 Spread",
            "W5 Area",
            "W5 Area Radius",
            "W5 Range Min",
            "W5 Range Max",
            "W5 Range Stop",
            "W5 Angle",
            "W5 Projectile Speed",
            "W5 Rotation Speed",

            "W6 ID",
            "W6 Base Dmg",
            "W6 Building Dmg",
            "W6 Land Forces Dmg",
            "W6 Aviation Dmg",
            "W6 Underwater Dmg",
            "W6 Fleet Dmg",
            "W6 Repairable Dmg",
            "W6 Disassemblable Dmg",
            "W6 Reload",
            "W6 Spread",
            "W6 Area",
            "W6 Area Radius",
            "W6 Range Min",
            "W6 Range Max",
            "W6 Range Stop",
            "W6 Angle",
            "W6 Projectile Speed",
            "W6 Rotation Speed",

            "W7 ID",
            "W7 Base Dmg",
            "W7 Building Dmg",
            "W7 Land Forces Dmg",
            "W7 Aviation Dmg",
            "W7 Underwater Dmg",
            "W7 Fleet Dmg",
            "W7 Repairable Dmg",
            "W7 Disassemblable Dmg",
            "W7 Reload",
            "W7 Spread",
            "W7 Area",
            "W7 Area Radius",
            "W7 Range Min",
            "W7 Range Max",
            "W7 Range Stop",
            "W7 Angle",
            "W7 Projectile Speed",
            "W7 Rotation Speed",

            "W8 ID",
            "W8 Base Dmg",
            "W8 Building Dmg",
            "W8 Land Forces Dmg",
            "W8 Aviation Dmg",
            "W8 Underwater Dmg",
            "W8 Fleet Dmg",
            "W8 Repairable Dmg",
            "W8 Disassemblable Dmg",
            "W8 Reload",
            "W8 Spread",
            "W8 Area",
            "W8 Area Radius",
            "W8 Range Min",
            "W8 Range Max",
            "W8 Range Stop",
            "W8 Angle",
            "W8 Projectile Speed",
            "W8 Rotation Speed",

            "W9 ID",
            "W9 Base Dmg",
            "W9 Building Dmg",
            "W9 Land Forces Dmg",
            "W9 Aviation Dmg",
            "W9 Underwater Dmg",
            "W9 Fleet Dmg",
            "W9 Repairable Dmg",
            "W9 Disassemblable Dmg",
            "W9 Reload",
            "W9 Spread",
            "W9 Area",
            "W9 Area Radius",
            "W9 Range Min",
            "W9 Range Max",
            "W9 Range Stop",
            "W9 Angle",
            "W9 Projectile Speed",
            "W9 Rotation Speed"
    );

    @Autowired
    private ModelExporterService exporterService;
    @Autowired
    private LocalizationService localizationService;

    @Override
    public String getName() {
        return TASK_NAME;
    }

    @Override
    public void execute(ExecutionPayload payload) throws TaskExecutionException {
        try {
            Collection<UnitModel> unitModels = payload.getUnits();
            Collection<LocalizationModel> localizationModels = payload.getLocalization();
            LocalizationModel localizationModel = localizationModels.stream()
                    .filter(locModel -> locModel.getLocale().equals(LOCALE))
                    .findAny()
                    .orElse(null);

            LOG.info("Converting unit models to excel table...");
            try (Workbook wb = getExcel(unitModels, localizationModel)) {
                LOG.info("Writing to file {}", FILENAME);
                wb.write(new FileOutputStream(FILENAME));
            }
        } catch (Exception ex) {
            throw new TaskExecutionException(ex);
        }
    }

    private Workbook getExcel(Collection<UnitModel> unitModels, LocalizationModel localizationModel) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("sheet-1");

        // setup headers
        Row columnNames = sheet.createRow(0);
        for (int i = 0; i < COLUMNS.size(); i++) {
            String columnName = COLUMNS.get(i);
            Cell cell = columnNames.createCell(i);
            cell.setCellValue(columnName);
        }

        // setup rows
        List<UnitModel> unitModelList = new ArrayList<>(unitModels);
        for (int i = 0; i < unitModelList.size(); i++) {
            UnitModel unitModel = unitModelList.get(i);
            Row row = sheet.createRow(i + 1);
            int counter = 0;

            if (unitModel.getNation() != null) {
                addStringCell(row, counter, unitModel.getNation().getName(), localizationModel);
            }
            counter++;

            addStringCell(row, counter, unitModel.getName(), localizationModel);
            counter++;

            addNumericCell(row, counter, unitModel.getGameId());
            counter++;

            addNumericCell(row, counter, unitModel.getHealth());
            counter++;

            addNumericCell(row, counter, unitModel.getViewRange());
            counter++;

            if (unitModel.getMovement() != null) {
                addNumericCell(row, counter, unitModel.getMovement().getSpeed());
                addNumericCell(row, counter + 1, unitModel.getMovement().getRotationSpeed());
            }
            counter += 2;

            if (unitModel.getTransporting() != null) {
                addNumericCell(row, counter, unitModel.getTransporting().getCarrySize());
                addNumericCell(row, counter + 1, unitModel.getTransporting().getOwnSize());
            }
            counter += 2;

            if (unitModel.getSupply() != null) {
                addNumericCell(row, counter, unitModel.getSupply().getProduce());
                addNumericCell(row, counter + 1, unitModel.getSupply().getConsume());
            }
            counter += 2;

            List<ArmorModel> armor = unitModel.getArmor();
            if (armor != null && !armor.isEmpty()) {
                addNumericCell(row, counter, armor.get(0).getValue());
                addStringCell(row, counter + 1, armor.get(0).getProbability() + "%", localizationModel);
                if (armor.size() > 1) {
                    addNumericCell(row, counter + 2, armor.get(1).getValue());
                    addStringCell(row, counter + 3, armor.get(1).getProbability() + "%", localizationModel);
                    if (armor.size() > 2) {
                        addNumericCell(row, counter + 4, armor.get(2).getValue());
                        addStringCell(row, counter + 5, armor.get(2).getProbability() + "%", localizationModel);
                        if (armor.size() > 3) {
                            addNumericCell(row, counter + 6, armor.get(3).getValue());
                            addStringCell(row, counter + 7, armor.get(3).getProbability() + "%", localizationModel);
                        }
                    }
                }
            }
            counter += 8;

            List<WeaponModel> weapons = unitModel.getWeapons();
            if (weapons != null && !weapons.isEmpty()) {
                for (int j = 0; j < weapons.size(); j++) {
                    WeaponModel weapon = weapons.get(j);
                    int columnIndex = counter + j * COLUMNS_PER_WEAPON;
                    addWeaponEntry(row, weapon, columnIndex, localizationModel, "");
                }
                counter += COLUMNS_PER_WEAPON * weapons.size();
            }

            List<TurretModel> turrets = unitModel.getTurrets();
            if (turrets != null && !turrets.isEmpty()) {
                for (int j = 0; j < turrets.size(); j++) {
                    TurretModel turret = turrets.get(j);
                    List<WeaponModel> turretWeapons = turret.getWeapons();
                    for (int k = 0; k < turretWeapons.size(); k++) {
                        WeaponModel weapon = turretWeapons.get(k);
                        int columnIndex = counter + (j + k) * COLUMNS_PER_WEAPON;
                        addWeaponEntry(row, weapon, columnIndex, localizationModel, "T" + turret.getTurretId());
                    }
                }
            }
            counter += COLUMNS_PER_WEAPON * WEAPONS_MAX;
        }

        return workbook;
    }

    private void addNumericCell(Row row, int index, Number value) {
        Cell cell = row.createCell(index);
        if (value != null) {
            cell.setCellValue(value.doubleValue());
        }
    }

    private void addStringCell(Row row, int index, String value, LocalizationModel localizationModel) {
        Cell cell = row.createCell(index);
        if (value != null && !value.equals("null")) {
            cell.setCellValue(localizationService.localize(value, localizationModel));
        }
    }

    private void addWeaponEntry(Row row, WeaponModel weapon, int columnIndex, LocalizationModel localizationModel, String turretIdSuffix) {
        int weaponId = weapon.getWeaponId();
        String id = turretIdSuffix + "W" + weaponId;
        DamageWrapperModel damage = weapon.getDamage();
        int damagesCount = damage.getDamagesCount() * weapon.getAttacksPerAttack() * weapon.getAttacksPerAction();
        Map<String, Number> damageMap = damage.getDamages().stream().collect(Collectors.toMap(DamageModel::getType, DamageModel::getValue));
        Number dmg0 = damageMap.get(DAMAGE_NAMES_LIST.get(0));
        Number dmg1 = damageMap.get(DAMAGE_NAMES_LIST.get(1));
        Number dmg2 = damageMap.get(DAMAGE_NAMES_LIST.get(2));
        Number dmg3 = damageMap.get(DAMAGE_NAMES_LIST.get(3));
        Number dmg4 = damageMap.get(DAMAGE_NAMES_LIST.get(4));
        Number dmg5 = damageMap.get(DAMAGE_NAMES_LIST.get(5));
        Number dmg6 = damageMap.get(DAMAGE_NAMES_LIST.get(6));
        Number dmg7 = damageMap.get(DAMAGE_NAMES_LIST.get(7));
        Number reload = weapon.getRechargePeriod();
        Number spread = weapon.getSpread();
        String area = damage.getAreaType();
        Number radius = damage.getRadius();
        Number rangeMin = weapon.getDistance().getMin();
        Number rangeMax = weapon.getDistance().getMax();
        Number rangeStop = weapon.getDistance().getStop();
        Number angle = weapon.getAngle();
        Number projectileSpeed = weapon.getProjectile() != null ? weapon.getProjectile().getSpeed() : null;

        addStringCell(row, columnIndex, id, localizationModel);
        addStringCell(row, columnIndex + 1, dmg0 != null && damagesCount > 1 ? damagesCount + "x" + dmg0 : dmg0 + "", localizationModel);
        addStringCell(row, columnIndex + 2, dmg1 != null && damagesCount > 1 ? damagesCount + "x" + dmg1 : dmg1 + "", localizationModel);
        addStringCell(row, columnIndex + 3, dmg2 != null && damagesCount > 1 ? damagesCount + "x" + dmg2 : dmg2 + "", localizationModel);
        addStringCell(row, columnIndex + 4, dmg3 != null && damagesCount > 1 ? damagesCount + "x" + dmg3 : dmg3 + "", localizationModel);
        addStringCell(row, columnIndex + 5, dmg4 != null && damagesCount > 1 ? damagesCount + "x" + dmg4 : dmg4 + "", localizationModel);
        addStringCell(row, columnIndex + 6, dmg5 != null && damagesCount > 1 ? damagesCount + "x" + dmg5 : dmg5 + "", localizationModel);
        addStringCell(row, columnIndex + 7, dmg6 != null && damagesCount > 1 ? damagesCount + "x" + dmg6 : dmg6 + "", localizationModel);
        addStringCell(row, columnIndex + 8, dmg7 != null && damagesCount > 1 ? damagesCount + "x" + dmg7 : dmg7 + "", localizationModel);
        addNumericCell(row, columnIndex + 9, reload);
        addNumericCell(row, columnIndex + 10, spread);
        addStringCell(row, columnIndex + 11, area, localizationModel);
        addNumericCell(row, columnIndex + 12, radius);
        addNumericCell(row, columnIndex + 13, rangeMin);
        addNumericCell(row, columnIndex + 14, rangeMax);
        addNumericCell(row, columnIndex + 15, rangeStop);
        addNumericCell(row, columnIndex + 16, angle);
        addNumericCell(row, columnIndex + 17, projectileSpeed);
    }
}
