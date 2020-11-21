package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
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
        final MappingIterator<Map<String, Object>> valueIterator = new CsvMapper()
                .readerFor(Map.class)
                .with(PERSON_SCHEMA)
                .readValues(csvStream);

        while (valueIterator.hasNext()) {
            final Map<String, Object> row = valueIterator.next();

            final LocalDate patientDOB = LocalDate.parse((String) row.get("patientDOB"));
            _ps.addPatient((String) row.get("patientID"),
                    (String) row.get("patientFirstName"),
                    (String) row.get("patientMiddleName"),
                    (String) row.get("patientLastName"),
                    (String) row.get("patientSuffix"),
                    patientDOB,
                    (String) row.get("patientStreet"),
                    (String) row.get("patientStreet2"),
                    (String) row.get("patientCity"),
                    (String) row.get("patientState"),
                    (String) row.get("patientZipCode"),
                    (String) row.get("patientCounty"),
                    (String) row.get("patientPhoneNumber"),
                    (String) row.get("typeOfHealthcareProfessional"),
                    (String) row.get("patientEmail"),
                    (String) row.get("patientRace"),
                    (String) row.get("patientGender"),
                    (String) row.get("patientEthnicity"),
                    Boolean.parseBoolean((String) row.get("residentCongregateSetting")),
                    Boolean.parseBoolean((String) row.get("employedInHealthcare")));
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
