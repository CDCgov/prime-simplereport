package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.Map;

/**
 * Created by nickrobison on 11/21/20
 */
@Service
@Transactional
public class UploadService {

    private static final CsvSchema PERSON_SCHEMA = personSchema();

    private final PersonService _ps;

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

            final LocalDate patientDOB = LocalDate.parse(row.get("patientDOB"));
            _ps.addPatient(row.get("patientID"),
                    row.get("patientFirstName"),
                    row.get("patientMiddleName"),
                    row.get("patientLastName"),
                    row.get("patientSuffix"),
                    patientDOB,
                    row.get("patientStreet"),
                    row.get("patientStreet2"),
                    row.get("patientCity"),
                    row.get("patientState"),
                    row.get("patientZipCode"),
                    row.get("patientCounty"),
                    row.get("patientPhoneNumber"),
                    row.get("typeOfHealthcareProfessional"),
                    row.get("patientEmail"),
                    row.get("patientRace"),
                    row.get("patientGender"),
                    row.get("patientEthnicity"),
                    Boolean.parseBoolean(row.get("residentCongregateSetting")),
                    Boolean.parseBoolean(row.get("employedInHealthcare")));
        }
    }

    private static CsvSchema personSchema() {
        return CsvSchema.builder()
                .addColumn("patientID", CsvSchema.ColumnType.STRING)
                .addColumn("patientFirstName", CsvSchema.ColumnType.STRING)
                .addColumn("patientMiddleName", CsvSchema.ColumnType.STRING)
                .addColumn("patientLastName", CsvSchema.ColumnType.STRING)
                .addColumn("patientSuffix", CsvSchema.ColumnType.STRING)
                .addColumn("patientRace", CsvSchema.ColumnType.STRING)
                .addColumn("patientDOB", CsvSchema.ColumnType.STRING)
                .addColumn("patientGender", CsvSchema.ColumnType.STRING)
                .addColumn("patientEthnicity", CsvSchema.ColumnType.STRING)
                .addColumn("patientStreet", CsvSchema.ColumnType.STRING)
                .addColumn("patientStreet2", CsvSchema.ColumnType.STRING)
                .addColumn("patientCity", CsvSchema.ColumnType.STRING)
                .addColumn("patientCounty", CsvSchema.ColumnType.STRING)
                .addColumn("patientState", CsvSchema.ColumnType.STRING)
                .addColumn("patientZipCode", CsvSchema.ColumnType.STRING)
                .addColumn("patientPhoneNumber", CsvSchema.ColumnType.STRING)
                .addColumn("patientEmail", CsvSchema.ColumnType.STRING)
                .addColumn("employedInHealthcare", CsvSchema.ColumnType.BOOLEAN)
                .addColumn("typeOfHealthcareProfessional", CsvSchema.ColumnType.STRING)
                .addColumn("residentCongregateSetting", CsvSchema.ColumnType.BOOLEAN)
                .addColumn("patientResidencyType", CsvSchema.ColumnType.STRING)
                .setUseHeader(true)
                .build();
    }
}
