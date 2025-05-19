package gov.cdc.usds.simplereport.api;

import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@Slf4j
@RequiredArgsConstructor
public class TestDataController {

  private static final String[] FIRST_NAMES = {
    "James",
    "Mary",
    "John",
    "Patricia",
    "Robert",
    "Jennifer",
    "Michael",
    "Linda",
    "William",
    "Elizabeth"
  };
  private static final String[] LAST_NAMES = {
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez"
  };
  private static final String[] DISEASES = {
    "COVID-19", "Influenza A", "Influenza B", "RSV", "Strep"
  };
  private static final String[] RESULTS = {"POSITIVE", "NEGATIVE", "UNDETERMINED", "INCONCLUSIVE"};
  private static final String[] DEVICE_NAMES = {
    "Abbott ID NOW", "BD Veritor", "Quidel Sofia", "Roche cobas", "LumiraDx"
  };
  private static final String[] GENDERS = {"Male", "Female", "Other", "Unknown"};
  private static final String[] RACES = {
    "White", "Black", "Asian", "American Indian", "Pacific Islander", "Other", "Unknown"
  };
  private static final String[] ETHNICITIES = {"Hispanic", "Non-Hispanic", "Unknown"};
  private static final String[] CITIES = {
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose"
  };
  private static final String[] STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA"
  };
  private static final Random RANDOM = new Random();
  private static final int FLUSH_ROW_INTERVAL = 5000;
  private static final int DAYS_PER_YEAR = 365;
  private static final int MIN_AGE = 18;
  private static final int MAX_AGE = 70;
  private static final long MILLIS_PER_DAY = 86400000L;
  private static final int TEST_LOOKBACK_DAYS = 90;
  private static final int PATIENT_ID_BASE = 100000;
  private static final int MODEL_SUFFIX_MAX = 100;
  private static final int SWAB_LOOKBACK_DAYS = 5;
  private static final int FACILITY_MAX = 5;
  private static final int SUBMITTER_MAX = 10;
  private static final int PHONE_AREA_MIN = 100;
  private static final int PHONE_AREA_RANGE = 900;
  private static final int PHONE_LOCAL_MIN = 1000;
  private static final int PHONE_LOCAL_RANGE = 9000;
  private static final int STREET_NUMBER_MAX = 9999;
  private static final int APARTMENT_MAX = 100;
  private static final int ZIP_MAX = 100000;
  private static final int COUNTY_MAX = 50;

  @GetMapping(value = "/api/test/large-csv")
  public ResponseEntity<StreamingResponseBody> generateLargeCsv(
      @RequestParam(defaultValue = "100") int rows) {

    log.info("Generating test CSV with {} rows", rows);

    StreamingResponseBody responseBody =
        outputStream -> {
          try (OutputStreamWriter writer =
                  new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
              CSVPrinter csvPrinter = createCsvPrinter(writer)) {

            for (int i = 0; i < rows; i++) {
              writeRandomRow(csvPrinter, i);

              if (i % FLUSH_ROW_INTERVAL == 0) {
                csvPrinter.flush();
                log.debug("Generated {} rows for test CSV", i);
              }
            }

            log.info("Completed generating test CSV with {} rows", rows);
          } catch (Exception e) { // NOPMD
            log.error("Error generating test CSV", e);
          }
        };

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String csvFileName = "test-data-" + timestamp + ".csv";

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + csvFileName)
        .header(HttpHeaders.CONTENT_TYPE, "text/csv;charset=UTF-8")
        .body(responseBody);
  }

  private CSVPrinter createCsvPrinter(OutputStreamWriter writer) throws Exception {
    return new CSVPrinter(
        writer,
        CSVFormat.DEFAULT.withHeader(
            "Patient first name",
            "Patient middle name",
            "Patient last name",
            "Patient full name",
            "Patient date of birth",
            "Test date",
            "Condition",
            "Result",
            "Result reported date",
            "Test correction status",
            "Test correction reason",
            "Device name",
            "Device manufacturer",
            "Device model",
            "Device swab type",
            "Has symptoms",
            "Symptoms present",
            "Symptom onset",
            "Facility name",
            "Submitter",
            "Patient role",
            "Patient ID (Student ID, Employee ID, etc.)",
            "Patient preferred language",
            "Patient phone number",
            "Patient email",
            "Patient street address",
            "Patient street address 2",
            "Patient city",
            "Patient state",
            "Patient zip code",
            "Patient county",
            "Patient country",
            "Patient gender",
            "Patient race",
            "Patient ethnicity",
            "Patient tribal affiliation",
            "Patient is a resident in a congregate setting",
            "Patient is employed in healthcare"));
  }

  private void writeRandomRow(CSVPrinter csvPrinter, int rowIndex) throws Exception {
    String firstName = FIRST_NAMES[RANDOM.nextInt(FIRST_NAMES.length)];
    String middleName = RANDOM.nextBoolean() ? FIRST_NAMES[RANDOM.nextInt(FIRST_NAMES.length)] : "";
    String lastName = LAST_NAMES[RANDOM.nextInt(LAST_NAMES.length)];
    String fullName = firstName + (middleName.isEmpty() ? " " : " " + middleName + " ") + lastName;

    Date birthDate =
        new Date(
            System.currentTimeMillis()
                - (RANDOM.nextInt(DAYS_PER_YEAR * MAX_AGE) + MIN_AGE * DAYS_PER_YEAR)
                    * MILLIS_PER_DAY);
    Date testDate =
        new Date(System.currentTimeMillis() - RANDOM.nextInt(TEST_LOOKBACK_DAYS) * MILLIS_PER_DAY);
    Date reportDate = new Date(testDate.getTime() + RANDOM.nextInt(2) * MILLIS_PER_DAY);

    String disease = DISEASES[RANDOM.nextInt(DISEASES.length)];
    String result = RESULTS[RANDOM.nextInt(RESULTS.length)];

    boolean hasSymptoms = RANDOM.nextBoolean();
    String symptomsText = hasSymptoms ? "Yes" : "No";
    String symptomsList = hasSymptoms ? "Fever, Cough, Fatigue" : "No symptoms";

    String deviceName = DEVICE_NAMES[RANDOM.nextInt(DEVICE_NAMES.length)];

    String patientId = "PT" + (PATIENT_ID_BASE + rowIndex);

    csvPrinter.printRecord(
        firstName,
        middleName,
        lastName,
        fullName,
        formatDate(birthDate),
        formatDateTime(testDate),
        disease,
        result,
        formatDateTime(reportDate),
        "ORIGINAL", // Correction status
        "", // Correction reason
        deviceName,
        "Manufacturer of " + deviceName,
        "Model X" + RANDOM.nextInt(TEST_LOOKBACK_DAYS),
        "Nasal Swab",
        symptomsText,
        symptomsList,
        hasSymptoms
            ? formatDate(
                new Date(testDate.getTime() - RANDOM.nextInt(SWAB_LOOKBACK_DAYS) * MILLIS_PER_DAY))
            : "",
        "Test Facility " + (RANDOM.nextInt(SWAB_LOOKBACK_DAYS) + 1),
        "Submitter User " + RANDOM.nextInt(SUBMITTER_MAX),
        "PATIENT",
        patientId,
        "English",
        "555-"
            + (PHONE_AREA_MIN + RANDOM.nextInt(PHONE_AREA_RANGE))
            + "-"
            + (PHONE_LOCAL_MIN + RANDOM.nextInt(PHONE_LOCAL_RANGE)),
        firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com",
        RANDOM.nextInt(STREET_NUMBER_MAX) + " Main Street",
        RANDOM.nextBoolean() ? "Apt " + RANDOM.nextInt(APARTMENT_MAX) : "",
        CITIES[RANDOM.nextInt(CITIES.length)],
        STATES[RANDOM.nextInt(STATES.length)],
        String.format("%05d", RANDOM.nextInt(ZIP_MAX)),
        "County " + RANDOM.nextInt(COUNTY_MAX),
        "USA",
        GENDERS[RANDOM.nextInt(GENDERS.length)],
        RACES[RANDOM.nextInt(RACES.length)],
        ETHNICITIES[RANDOM.nextInt(ETHNICITIES.length)],
        "",
        RANDOM.nextBoolean(),
        RANDOM.nextBoolean());
  }

  private String formatDate(Date date) {
    return new SimpleDateFormat("MM/dd/yyyy").format(date);
  }

  private String formatDateTime(Date date) {
    return new SimpleDateFormat("MM/dd/yyyy h:mma").format(date);
  }
}
