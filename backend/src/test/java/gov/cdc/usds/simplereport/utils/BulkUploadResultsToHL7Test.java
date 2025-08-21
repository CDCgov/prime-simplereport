package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.parser.Parser;
import gov.cdc.usds.simplereport.api.converter.HL7Converter;
import gov.cdc.usds.simplereport.api.converter.HapiContextProvider;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.db.model.auxiliary.HL7BatchMessage;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.info.GitProperties;

@ExtendWith(MockitoExtension.class)
public class BulkUploadResultsToHL7Test {
  private static GitProperties gitProperties;
  private static ResultsUploaderCachingService resultsUploaderCachingService;
  private static final Instant commitTime = (new Date(1675891986000L)).toInstant();
  final HapiContext ctx = HapiContextProvider.get();
  final Parser parser = ctx.getPipeParser();
  private final UUIDGenerator uuidGenerator = new UUIDGenerator();
  private final DateGenerator dateGenerator = new DateGenerator();
  BulkUploadResultsToHL7 sut;

  @BeforeAll
  public static void init() {
    gitProperties = mock(GitProperties.class);
    when(gitProperties.getCommitTime()).thenReturn(commitTime);
    when(gitProperties.getShortCommitId()).thenReturn("short-commit-id");
  }

  @BeforeEach
  public void beforeEach() {
    resultsUploaderCachingService = mock(ResultsUploaderCachingService.class);

    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("ID NOW|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

    when(resultsUploaderCachingService.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(
            Map.of(
                "Nasal swab".toLowerCase(),
                "445297001",
                "Anterior nares swab".toLowerCase(),
                "697989009",
                "Venous blood specimen".toLowerCase(),
                "122555007"));

    when(resultsUploaderCachingService.getSNOMEDToSpecimenTypeNameMap())
        .thenReturn(
            Map.of(
                "445297001",
                "Nasal swab",
                "697989009",
                "Anterior nares swab",
                "122555007",
                "Venous blood specimen"));

    HL7Converter hl7Converter = new HL7Converter(uuidGenerator, dateGenerator);
    sut =
        new BulkUploadResultsToHL7(
            hl7Converter, gitProperties, dateGenerator, resultsUploaderCachingService);
  }

  @Test
  void convertExistingCsv_success() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.message()).isNotEmpty();
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
    assertThat(batchMessage.metadata()).containsKey("COVID-19");
    assertThat(batchMessage.metadata().get("COVID-19")).isEqualTo(1);

    // Verify the message contains expected HL7 segments
    String[] lines = batchMessage.message().split("\n");
    assertThat(lines).anyMatch(line -> line.startsWith("FHS"));
    assertThat(lines).anyMatch(line -> line.startsWith("BHS"));
    assertThat(lines).anyMatch(line -> line.startsWith("MSH"));
    assertThat(lines).anyMatch(line -> line.startsWith("PID"));
    assertThat(lines).anyMatch(line -> line.startsWith("OBR"));
    assertThat(lines).anyMatch(line -> line.startsWith("OBX"));
    assertThat(lines).anyMatch(line -> line.startsWith("BTS"));
    assertThat(lines).anyMatch(line -> line.startsWith("FTS"));

    verify(resultsUploaderCachingService, times(1)).getModelAndTestPerformedCodeToDeviceMap();
  }

  @Test
  void requiredFieldsOnlyCsv_success() throws IOException {
    String testFileName = "testResultUpload/test-results-upload-valid-required-only.csv";

    // check test file is up to date with list of required fields
    Set<String> requiredFields = new HashSet<>(TestResultRow.getStaticRequiredFields());
    Set<String> testFileFields = new HashSet<>(getColumnNames(testFileName));
    assertEquals(requiredFields, testFileFields);

    InputStream input = loadCsv(testFileName);
    assertDoesNotThrow(() -> sut.convertToHL7BatchMessage(input));
  }

  @Test
  void convertExistingCsv_TestOrderedCodeMapped() throws IOException {
    byte[] input = loadCsv("testResultUpload/test-results-upload-all-fields.csv").readAllBytes();
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(new ByteArrayInputStream(input));
    var mappingIterator = getIteratorForCsv(new ByteArrayInputStream(input));

    int index = 0;
    while (mappingIterator.hasNext()) {
      var csvRow = mappingIterator.next();
      var inputOrderedCode = csvRow.get("test_ordered_code");
      var inputPerformedCode = csvRow.get("test_performed_code");

      // Parse the HL7 message to find OBR segment
      String[] lines = batchMessage.message().split("\n");
      String obrLine = null;
      for (String line : lines) {
        if (line.startsWith("OBR")) {
          obrLine = line;
          break;
        }
      }

      assertThat(obrLine).isNotNull();
      String[] obrFields = obrLine.split("\\|");
      // OBR-4 contains the universal service identifier (test ordered code)
      String mappedCode = obrFields.length > 4 ? obrFields[4] : "";

      // value is mapped
      assertThat(mappedCode).isEqualTo(inputOrderedCode);
      // value is not defaulted to performed code
      assertThat(inputOrderedCode).isNotEqualTo(inputPerformedCode);
    }
  }

  @Test
  void validCsv_TestOrderedCodeDefaultedToPerformedCode() throws IOException {
    byte[] input = loadCsv("testResultUpload/test-results-upload-valid.csv").readAllBytes();

    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(new ByteArrayInputStream(input));
    var mappingIterator = getIteratorForCsv(new ByteArrayInputStream(input));

    int index = 0;
    while (mappingIterator.hasNext()) {
      var csvRow = mappingIterator.next();
      var inputOrderedCode = csvRow.get("test_ordered_code");
      var inputPerformedCode = csvRow.get("test_performed_code");

      // Parse the HL7 message to find OBR segment
      String[] lines = batchMessage.message().split("\n");
      String obrLine = null;
      for (String line : lines) {
        if (line.startsWith("OBR")) {
          obrLine = line;
          break;
        }
      }

      assertThat(obrLine).isNotNull();
      String[] obrFields = obrLine.split("\\|");
      // OBR-4 contains the universal service identifier (test ordered code)
      String mappedCode = obrFields.length > 4 ? obrFields[4] : "";

      // when supplied orderedCode is empty
      assertThat(inputOrderedCode).isEmpty();
      // value is defaulted to performed code
      assertThat(mappedCode).isEqualTo(inputPerformedCode);
    }
  }

  @Test
  void convertExistingCsv_observationValuesPresent() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that MSH segment is present and properly formatted
    String mshLine = null;
    for (String line : lines) {
      if (line.startsWith("MSH")) {
        mshLine = line;
        break;
      }
    }
    assertThat(mshLine).isNotNull();
    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(10);
    assertThat(mshFields[3]).isEqualTo("My Testing Lab"); // sending facility
    assertThat(mshFields[5]).isEqualTo("APHL"); // receiving facility

    // Check that PID segment is present
    String pidLine = null;
    for (String line : lines) {
      if (line.startsWith("PID")) {
        pidLine = line;
        break;
      }
    }
    assertThat(pidLine).isNotNull();
    String[] pidFields = pidLine.split("\\|");
    assertThat(pidFields).hasSizeGreaterThan(5);
    assertThat(pidFields[5]).contains("Doe^Jane"); // patient name

    // Check that OBR segment is present
    String obrLine = null;
    for (String line : lines) {
      if (line.startsWith("OBR")) {
        obrLine = line;
        break;
      }
    }
    assertThat(obrLine).isNotNull();
    String[] obrFields = obrLine.split("\\|");
    assertThat(obrFields).hasSizeGreaterThan(10);
    assertThat(obrFields[2]).isEqualTo("123"); // filler order number (accession number)

    // Check that OBX segment is present
    String obxLine = null;
    for (String line : lines) {
      if (line.startsWith("OBX")) {
        obxLine = line;
        break;
      }
    }
    assertThat(obxLine).isNotNull();
    String[] obxFields = obxLine.split("\\|");
    assertThat(obxFields).hasSizeGreaterThan(5);
    assertThat(obxFields[5]).isEqualTo("260373001"); // test result SNOMED code for "Detected"

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_populatesBlankFields() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-blank-dates.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that SPM segment has proper dates
    String spmLine = null;
    for (String line : lines) {
      if (line.startsWith("SPM")) {
        spmLine = line;
        break;
      }
    }
    assertThat(spmLine).isNotNull();
    String[] spmFields = spmLine.split("\\|");
    assertThat(spmFields).hasSizeGreaterThan(17);

    // SPM-17 should contain collection date (when blank, defaults to order test date)
    assertThat(spmFields[17]).isNotEmpty();

    // SPM-18 should contain received date (when blank, defaults to order test date)
    assertThat(spmFields[18]).isNotEmpty();

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_multipleRecords() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.recordsCount()).isEqualTo(7);
    assertThat(batchMessage.metadata()).containsKey("COVID-19");
    assertThat(batchMessage.metadata().get("COVID-19")).isEqualTo(7);

    // Count the number of MSH segments (one per record)
    String[] lines = batchMessage.message().split("\n");
    long mshCount = Arrays.stream(lines).filter(line -> line.startsWith("MSH")).count();
    assertThat(mshCount).isEqualTo(7);

    // Count the number of PID segments (one per record)
    long pidCount = Arrays.stream(lines).filter(line -> line.startsWith("PID")).count();
    assertThat(pidCount).isEqualTo(7);

    // Count the number of OBR segments (one per record)
    long obrCount = Arrays.stream(lines).filter(line -> line.startsWith("OBR")).count();
    assertThat(obrCount).isEqualTo(7);

    // Count the number of OBX segments (one per record)
    long obxCount = Arrays.stream(lines).filter(line -> line.startsWith("OBX")).count();
    assertThat(obxCount).isEqualTo(7);
  }

  @Test
  void convertExistingCsv_batchMessageStructure() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check batch message structure
    assertThat(lines[0]).startsWith("FHS"); // File header segment
    assertThat(lines[1]).startsWith("BHS"); // Batch header segment

    // Find the last two lines
    String secondToLastLine = lines[lines.length - 2];
    String lastLine = lines[lines.length - 1];

    assertThat(secondToLastLine).startsWith("BTS"); // Batch trailer segment
    assertThat(lastLine).startsWith("FTS"); // File trailer segment

    // Check that BTS contains the correct count
    String[] btsFields = secondToLastLine.split("\\|");
    assertThat(btsFields[1]).isEqualTo("1"); // batch message count

    // Check that FTS contains the correct count
    String[] ftsFields = lastLine.split("\\|");
    assertThat(ftsFields[1]).isEqualTo("1"); // file message count
  }

  @Test
  void convertExistingCsv_specimenTypeMapping() {
    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-specimenType-loinc.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that SPM segment has proper specimen type mapping
    String spmLine = null;
    for (String line : lines) {
      if (line.startsWith("SPM")) {
        spmLine = line;
        break;
      }
    }
    assertThat(spmLine).isNotNull();
    String[] spmFields = spmLine.split("\\|");
    assertThat(spmFields).hasSizeGreaterThan(4);

    // SPM-4 should contain specimen type code
    assertThat(spmFields[4]).isNotEmpty();

    // SPM-6 should contain specimen type name
    assertThat(spmFields[6]).isNotEmpty();

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_testResultMapping() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Find all OBX segments and check their result values
    for (String line : lines) {
      if (line.startsWith("OBX")) {
        String[] obxFields = line.split("\\|");
        assertThat(obxFields).hasSizeGreaterThan(5);

        // OBX-5 should contain the test result value
        String resultValue = obxFields[5];
        assertThat(resultValue).isNotEmpty();

        // Check that it's a valid SNOMED code or text
        assertThat(resultValue).matches("^\\d+$|^[A-Za-z\\s]+$");
      }
    }

    assertThat(batchMessage.recordsCount()).isEqualTo(7);
  }

  @Test
  void convertExistingCsv_encodingCharacters() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that MSH segment has proper encoding characters
    String mshLine = null;
    for (String line : lines) {
      if (line.startsWith("MSH")) {
        mshLine = line;
        break;
      }
    }
    assertThat(mshLine).isNotNull();
    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(3);

    // MSH-2 should contain encoding characters
    assertThat(mshFields[2]).isEqualTo("^~\\&");

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_messageControlId() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that MSH segment has message control ID
    String mshLine = null;
    for (String line : lines) {
      if (line.startsWith("MSH")) {
        mshLine = line;
        break;
      }
    }
    assertThat(mshLine).isNotNull();
    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(9);

    // MSH-10 should contain message control ID
    assertThat(mshFields[10]).isNotEmpty();

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_softwareSegment() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that SFT segment is present (software segment)
    boolean hasSftSegment = Arrays.stream(lines).anyMatch(line -> line.startsWith("SFT"));
    assertThat(hasSftSegment).isTrue();

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_orderingProviderInformation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that OBR segment contains ordering provider information
    String obrLine = null;
    for (String line : lines) {
      if (line.startsWith("OBR")) {
        obrLine = line;
        break;
      }
    }
    assertThat(obrLine).isNotNull();
    String[] obrFields = obrLine.split("\\|");
    assertThat(obrFields).hasSizeGreaterThan(16);

    // OBR-16 should contain ordering provider name
    assertThat(obrFields[16]).contains("Smith");

    // OBR-17 should contain ordering provider identifier
    assertThat(obrFields[17]).isEqualTo("1013012657");

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_facilityInformation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that MSH segment contains facility information
    String mshLine = null;
    for (String line : lines) {
      if (line.startsWith("MSH")) {
        mshLine = line;
        break;
      }
    }
    assertThat(mshLine).isNotNull();
    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(5);

    // MSH-4 should contain sending facility
    assertThat(mshFields[4]).contains("My Testing Lab");

    // MSH-6 should contain receiving facility
    assertThat(mshFields[6]).isEqualTo("APHL");

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_patientAddress() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that PID segment contains patient address
    String pidLine = null;
    for (String line : lines) {
      if (line.startsWith("PID")) {
        pidLine = line;
        break;
      }
    }
    assertThat(pidLine).isNotNull();
    String[] pidFields = pidLine.split("\\|");
    assertThat(pidFields).hasSizeGreaterThan(11);

    // PID-11 should contain patient address
    assertThat(pidFields[11]).contains("123 Main St");
    assertThat(pidFields[11]).contains("Birmingham");
    assertThat(pidFields[11]).contains("AL");
    assertThat(pidFields[11]).contains("35226");

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_testResultDate() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().split("\n");

    // Check that OBX segment contains test result date
    String obxLine = null;
    for (String line : lines) {
      if (line.startsWith("OBX")) {
        obxLine = line;
        break;
      }
    }
    assertThat(obxLine).isNotNull();
    String[] obxFields = obxLine.split("\\|");
    assertThat(obxFields).hasSizeGreaterThan(14);

    // OBX-14 should contain observation date/time
    assertThat(obxFields[14]).isNotEmpty();
    assertThat(obxFields[14]).matches("\\d{14}"); // HL7 date format

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_requiredFieldsValidation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-required-only.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.message()).isNotEmpty();
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
    assertThat(batchMessage.metadata()).isNotNull();

    // Verify that the message can be parsed by HAPI
    assertDoesNotThrow(
        () -> {
          String[] lines = batchMessage.message().split("\n");
          for (String line : lines) {
            if (line.startsWith("MSH")) {
              parser.parse(line);
              break;
            }
          }
        });
  }

  @Test
  void convertExistingCsv_diseaseTracking() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.metadata()).containsKey("COVID-19");
    assertThat(batchMessage.metadata().get("COVID-19")).isEqualTo(7);
    assertThat(batchMessage.recordsCount()).isEqualTo(7);
  }

  @Test
  void convertExistingCsv_noDeviceMapping() {
    // Test with a device that doesn't exist in the mapping
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of());

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.message()).isNotEmpty();
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
    // Should still track disease from LOINC mapping
    assertThat(batchMessage.metadata()).containsKey("COVID-19");
  }

  private InputStream loadCsv(String csvFile) {
    return BulkUploadResultsToHL7Test.class.getClassLoader().getResourceAsStream(csvFile);
  }

  private List<String> getColumnNames(String csvFileName) throws IOException {
    try (InputStream input = loadCsv(csvFileName);
        BufferedReader reader = new BufferedReader(new InputStreamReader(input))) {
      String headerLine = reader.readLine();
      return Arrays.asList(headerLine.split(","));
    }
  }
}
