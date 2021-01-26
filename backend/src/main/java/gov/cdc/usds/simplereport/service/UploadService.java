package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
		"Hispanic or Latino", "hispanic",
		"Not Hispanic", "not_hispanic"
	);

	private Map<String, Boolean> yesNoMap = Map.of(
		"Yes", true,
		"No", false
	);

    public UploadService(PersonService ps) {
        this._ps = ps;
    }

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
            final String phone = normalizePhoneNumber(row.get("PhoneNumber"));
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
                    ethnicityMap.get(row.get("Ethnicity")),
                    row.get("Gender").toLowerCase(),
                    yesNoMap.get(row.get("residentCongregateSetting")),
                    yesNoMap.get(row.get("employedInHealthcare")));
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
                .addColumn("Location", CsvSchema.ColumnType.STRING)
                .setUseHeader(true)
                .build();
    }

    private static String normalizePhoneNumber(String suppliedNumber) {
        if (suppliedNumber == null || suppliedNumber == "") {
            return null;
        }

        try {
            var phoneUtil = PhoneNumberUtil.getInstance();
            return phoneUtil.format(phoneUtil.parse(suppliedNumber, "US"), PhoneNumberUtil.PhoneNumberFormat.NATIONAL);
        } catch (NumberParseException parseException) {
            throw new IllegalArgumentException("[" + suppliedNumber + "] is not a valid phone number.", parseException);
        }
    }
}
