package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;

import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/**
 * Created by nickrobison on 11/21/20
 */
@Service
@Transactional
public class UploadService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy");

    private static final CsvSchema PERSON_SCHEMA = personSchema();
    private static final String FACILITY_ID = "facilityId";

    private final PersonService _ps;

    private Map<String, String> ethnicityMap = Map.of(
        "hispanic", "hispanic",
        "hispanic or hatino", "hispanic",
        "not hispanic", "not_hispanic"
    );

    private Map<String, Boolean> yesNoMap = Map.of(
        "y", true,
        "yes", true,
        "n", false,
        "no", false
    );

    public UploadService(PersonService ps) {
        this._ps = ps;
    }

    @AuthorizationConfiguration.RequirePermissionExportTestEvent
    @Transactional
    public void processPersonCSV(InputStream csvStream) throws IOException {
        final MappingIterator<Map<String, String>> valueIterator = new CsvMapper()
                .enable(CsvParser.Feature.FAIL_ON_MISSING_COLUMNS)
                .readerFor(Map.class)
                .with(PERSON_SCHEMA)
                .readValues(csvStream);

        // Since the CSV parser won't fail when give a single string, we simple check to see if it has any parsed values
        // If not, we throw an error assuming the user didn't actually want to submit something empty.
        if (!valueIterator.hasNext()) {
            throw new IllegalArgumentException("Empty or invalid CSV submitted");
        }

        while (valueIterator.hasNext()) {
            final Map<String, String> row = valueIterator.next();

            final LocalDate patientDOB = LocalDate.parse(row.get("DOB"), DATE_FORMATTER);
            final String phone = parsePhoneNumber(row.get("PhoneNumber"));
            _ps.addPatient(
                row.get(FACILITY_ID).equals("") ? null : UUID.fromString(row.get(FACILITY_ID)),
                null,
                row.get("FirstName"),
                row.get("MiddleName"),
                row.get("LastName"),
                row.get("Suffix"),
                patientDOB,
                row.get("Street"),
                row.get("Street2"),
                row.get("City"),
                row.get("State"),
                row.get("ZipCode"),
                phone,
                row.get("Role").toUpperCase(),
                row.get("Email"),
                row.get("County"),
                row.get("Race").toLowerCase(),
                ethnicityMap.get(row.get("Ethnicity").toLowerCase()),
                row.get("Gender").toLowerCase(),
                yesNoMap.get(row.get("residentCongregateSetting").toLowerCase()),
                yesNoMap.get(row.get("employedInHealthcare").toLowerCase())
            );
        }
    }

    private static CsvSchema personSchema() {
        return CsvSchema.builder()
                .addColumn("FirstName", CsvSchema.ColumnType.STRING)
                .addColumn("LastName", CsvSchema.ColumnType.STRING)
                .addColumn("MiddleName", CsvSchema.ColumnType.STRING)
                .addColumn("Suffix", CsvSchema.ColumnType.STRING)
                .addColumn("Race", CsvSchema.ColumnType.STRING)
                .addColumn("DOB", CsvSchema.ColumnType.STRING)
                .addColumn("Gender", CsvSchema.ColumnType.STRING)
                .addColumn("Ethnicity", CsvSchema.ColumnType.STRING)
                .addColumn("Street", CsvSchema.ColumnType.STRING)
                .addColumn("Street2", CsvSchema.ColumnType.STRING)
                .addColumn("City", CsvSchema.ColumnType.STRING)
                .addColumn("County", CsvSchema.ColumnType.STRING)
                .addColumn("State", CsvSchema.ColumnType.STRING)
                .addColumn("ZipCode", CsvSchema.ColumnType.STRING)
                .addColumn("PhoneNumber", CsvSchema.ColumnType.STRING)
                .addColumn("employedInHealthcare", CsvSchema.ColumnType.STRING)
                .addColumn("residentCongregateSetting", CsvSchema.ColumnType.STRING)
                .addColumn("Role", CsvSchema.ColumnType.STRING)
                .addColumn("Email", CsvSchema.ColumnType.STRING)
                .addColumn(FACILITY_ID, CsvSchema.ColumnType.STRING)
                .setUseHeader(true)
                .build();
    }

}
