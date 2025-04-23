package com.wsunitstats.exporter.task;

import com.wsunitstats.exporter.exception.TaskExecutionException;
import com.wsunitstats.exporter.model.exported.LocalizationModel;
import com.wsunitstats.exporter.model.exported.UnitModel;
import com.wsunitstats.exporter.model.exported.submodel.ResourceModel;
import com.wsunitstats.exporter.model.exported.submodel.UnitSourceModel;
import com.wsunitstats.exporter.service.LocalizationService;
import com.wsunitstats.exporter.service.ModelExporterService;
import com.wsunitstats.exporter.service.UnitCategoryService;
import com.wsunitstats.exporter.service.UnitValueCalculator;
import com.wsunitstats.exporter.utils.Constants.AdvancedUnitCategory;
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
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Task to get any file with any content (for informational and test purposes)
 */
@Component
public class WriteExcelUnitCostTask implements ExecutionTask {
    private static final Logger LOG = LogManager.getLogger(WriteExcelUnitCostTask.class);
    private static final String TASK_NAME = "writeExcelCosts";
    private static final String FILENAME = "excel-unit-costs-output.xlsx";
    private static final String LOCALE = "en";

    private static final List<String> COLUMNS = List.of(
            "ID",
            "Nation",
            "Cost value",
            "Kill value",
            "Group",
            "Name"
    );

    @Autowired
    private ModelExporterService exporterService;
    @Autowired
    private LocalizationService localizationService;
    @Autowired
    private UnitCategoryService unitCategoryService;
    @Autowired
    private UnitValueCalculator unitValueCalculator;

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

    private Workbook getExcel(Collection<UnitModel> unitModels, LocalizationModel localizationModel) {
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

            addNumericCell(row, counter, unitModel.getGameId());
            counter++;

            addStringCell(row, counter, unitModel.getNation().getName().getIr1(), localizationModel);
            counter++;

            addNumericCell(row, counter, unitValueCalculator.calcUnitCostValue(unitModel));
            counter++;

            addNumericCell(row, counter, unitModel.getKillValue());
            counter++;

            addStringCell(row, counter, unitModel.getAdvancedCategory(), localizationModel);
            counter++;

            addStringCell(row, counter, unitModel.getName(), localizationModel);
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
}
