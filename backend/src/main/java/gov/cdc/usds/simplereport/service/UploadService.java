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
import java.util.ArrayList;
import java.util.List;

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

            final LocalDate patientDOB = LocalDate.parse(row.get("DOB"));
            ArrayList<String> race = new ArrayList<String>();
            race.add(row.get("Race"));
            _ps.addPatient(row.get("ID"),
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
                    row.get("County"),
                    row.get("PhoneNumber"),
                    row.get("typeOfHealthcareProfessional"),
                    row.get("Email"),
                    race,
                    row.get("Gender"),
                    row.get("Ethnicity"),
                    Boolean.parseBoolean(row.get("residentCongregateSetting")),
                    Boolean.parseBoolean(row.get("employedInHealthcare")));
        }
    }

    private static CsvSchema personSchema() {
        return CsvSchema.builder()
                .addColumn("ID", CsvSchema.ColumnType.STRING)
                .addColumn("FirstName", CsvSchema.ColumnType.STRING)
                .addColumn("MiddleName", CsvSchema.ColumnType.STRING)
                .addColumn("LastName", CsvSchema.ColumnType.STRING)
                .addColumn("Suffix", CsvSchema.ColumnType.STRING)
                .addColumn("Race", CsvSchema.ColumnType.ARRAY)
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
                .addColumn("Email", CsvSchema.ColumnType.STRING)
                .addColumn("employedInHealthcare", CsvSchema.ColumnType.BOOLEAN)
                .addColumn("typeOfHealthcareProfessional", CsvSchema.ColumnType.STRING)
                .addColumn("residentCongregateSetting", CsvSchema.ColumnType.BOOLEAN)
                .addColumn("ResidencyType", CsvSchema.ColumnType.STRING)
                .setUseHeader(true)
                .build();
    }
}
