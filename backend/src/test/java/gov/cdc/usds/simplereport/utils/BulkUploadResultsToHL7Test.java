package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.parser.Parser;
import com.smartystreets.api.exceptions.SmartyException;
import gov.cdc.usds.simplereport.api.converter.HL7Converter;
import gov.cdc.usds.simplereport.api.converter.HapiContextProvider;
import gov.cdc.usds.simplereport.db.model.auxiliary.HL7BatchMessage;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.info.GitProperties;

@ExtendWith(MockitoExtension.class)
public class BulkUploadResultsToHL7Test {

  private static GitProperties gitProperties;
  private static ResultsUploaderCachingService resultsUploaderCachingService;
  private static final Instant commitTime = (new Date(1675891986000L)).toInstant();
  private final HapiContext hapiContext = HapiContextProvider.get();
  private final Parser parser = hapiContext.getPipeParser();
  private final UUIDGenerator uuidGenerator = new UUIDGenerator();
  private final DateGenerator dateGenerator = new DateGenerator();
  BulkUploadResultsToHL7 sut;

  @Mock private HL7Converter hl7Converter;

  @BeforeAll
  public static void init() throws SmartyException, IOException, InterruptedException {
    gitProperties = mock(GitProperties.class);
    when(gitProperties.getCommitTime()).thenReturn(commitTime);
    when(gitProperties.getShortCommitId()).thenReturn("abc123");

    resultsUploaderCachingService = mock(ResultsUploaderCachingService.class);
  }

  @BeforeEach
  public void beforeEach() {
    // Stub device and specimen maps used by converter
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("ID NOW|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

    when(resultsUploaderCachingService.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(
            Map.of(
                "nasal swab",
                "445297001",
                "anterior nares swab",
                "697989009",
                "venous blood specimen",
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
    assertThat(batchMessage.reportedDiseases()).isNotNull();

    String[] lines = getHL7Lines(batchMessage);
    assertThat(lines).isNotEmpty();

    assertThat(hasSegment(lines, "FHS")).isTrue();
    assertThat(hasSegment(lines, "BHS")).isTrue();
    assertThat(hasSegment(lines, "MSH")).isTrue();
    assertThat(hasSegment(lines, "BTS")).isTrue();
    assertThat(hasSegment(lines, "FTS")).isTrue();
  }

  @Test
  void convertExistingCsv_TestOrderedCodeMapped() throws IOException {
    InputStream input = loadCsv("testResultUpload/test-results-upload-all-fields.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    // Read first row to get expected codes
    var mappingIterator =
        getIteratorForCsv(loadCsv("testResultUpload/test-results-upload-all-fields.csv"));
    var csvRow = mappingIterator.next();
    var inputOrderedCode = csvRow.get("test_ordered_code");
    var inputPerformedCode = csvRow.get("test_performed_code");

    // Verify that ordered code appears in message content
    assertThat(batchMessage.message()).contains(inputOrderedCode);
    assertThat(batchMessage.message()).contains(inputPerformedCode);

    // Verify proper HL7 structure
    String[] lines = getHL7Lines(batchMessage);
    String obrLine = getSegmentLine(lines, "OBR");
    assertThat(obrLine).isNotNull();
    assertThat(obrLine).contains(inputOrderedCode);
    assertThat(inputOrderedCode).isNotEqualTo(inputPerformedCode);
  }

  @Test
  void validCsv_TestOrderedCodeDefaultedToPerformedCode() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    // when supplied orderedCode is empty, performed code should be present
    assertThat(batchMessage.message()).contains("94534-5");
  }

  @Test
  void convertExistingCsv_observationValuesPresent() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String mshLine = getSegmentLine(lines, "MSH");
    assertThat(mshLine).isNotNull();

    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(6);

    // MSH-2 is encoding characters
    assertThat(mshFields[1]).isEqualTo("^~\\&");

    // MSH-4 should include APHL OID
    String aphlOid = "2.16.840.1.113883.3.8589";
    assertThat(mshFields[4]).contains(aphlOid);

    assertThat(hasSegment(lines, "PID")).isTrue();
    assertThat(hasSegment(lines, "OBR")).isTrue();
    assertThat(hasSegment(lines, "OBX")).isTrue();

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_multipleRecords() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.recordsCount()).isEqualTo(6);
    assertThat(batchMessage.reportedDiseases()).isNotNull();

    String[] lines = getHL7Lines(batchMessage);
    assertThat(hasSegment(lines, "PID")).isTrue();
    assertThat(hasSegment(lines, "OBR")).isTrue();
    assertThat(hasSegment(lines, "OBX")).isTrue();
    assertThat(hasSegment(lines, "MSH")).isTrue();
  }

  @Test
  void convertExistingCsv_specimenTypeMapping() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String spmLine = getSegmentLine(lines, "SPM");
    assertThat(spmLine).isNotNull();

    String[] spmFields = spmLine.split("\\|");
    assertThat(spmFields).hasSizeGreaterThan(4);

    // SPM-4 is a CWE with SNOMED code and display name
    String cwe = spmFields[4];
    assertThat(cwe).isNotEmpty();
    String[] cweParts = cwe.split("\\^");
    assertThat(cweParts.length).isGreaterThan(2);

    // Code should be the SNOMED for Nasal swab; display should contain the name
    assertThat(cweParts[0]).isEqualTo("445297001");
    assertThat(cweParts[1].toLowerCase()).contains("nasal");
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_testResultMapping() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    assertThat(hasSegment(lines, "OBX")).isTrue();
    assertThat(batchMessage.recordsCount()).isEqualTo(6);

    long obxCount = Arrays.stream(lines).filter(line -> line.startsWith("OBX")).count();
    assertThat(obxCount).isGreaterThan(0);

    // Verify OBX structure contains result values
    String obxLine = getSegmentLine(lines, "OBX");
    String[] obxFields = obxLine.split("\\|");
    assertThat(obxFields).hasSizeGreaterThan(5);
  }

  @Test
  void convertExistingCsv_softwareSegment() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    boolean hasSftSegment = hasSegment(lines, "SFT");

    assertThat(hasSftSegment).isTrue();
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_orderingProviderInformation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.message()).contains("Smith");
    assertThat(batchMessage.message()).contains("1013012657");
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_facilityInformation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String mshLine = getSegmentLine(lines, "MSH");
    assertThat(mshLine).isNotNull();

    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(6);

    String aphlOid = "2.16.840.1.113883.3.8589";
    assertThat(mshFields[4]).contains(aphlOid);
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_patientAddress() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    // Ensure patient address parts are present in the message
    assertThat(batchMessage.message()).contains("123 Main St");
    assertThat(batchMessage.message()).contains("Birmingham");
    assertThat(batchMessage.message()).contains("AL");
    assertThat(batchMessage.message()).contains("35226");
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_testResultDate() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    assertThat(hasSegment(lines, "OBX")).isTrue();

    String obxLine = getSegmentLine(lines, "OBX");
    assertThat(obxLine).isNotNull();

    String[] obxFields = obxLine.split("\\|");
    assertThat(obxFields).hasSizeGreaterThan(10);
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_diseaseTracking() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.reportedDiseases()).isNotNull();
    assertThat(batchMessage.recordsCount()).isEqualTo(6);

    String[] lines = getHL7Lines(batchMessage);
    // Should have multiple MSH segments for multiple records
    long mshCount = Arrays.stream(lines).filter(line -> line.startsWith("MSH")).count();
    assertThat(mshCount).isEqualTo(6);
  }

  @Test
  void convertExistingCsv_populatesBlankFields() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-blank-dates.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
    assertThat(batchMessage.message()).isNotEmpty();

    String[] lines = getHL7Lines(batchMessage);
    assertThat(hasSegment(lines, "MSH")).isTrue();
    assertThat(hasSegment(lines, "PID")).isTrue();
  }

  @Test
  void convertExistingCsv_encodingCharacters() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String mshLine = getSegmentLine(lines, "MSH");
    assertThat(mshLine).isNotNull();

    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(2);

    // MSH-2 (index 1) should contain encoding characters
    assertThat(mshFields[1]).isEqualTo("^~\\&");
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void headerSegments_includeExpectedDatetimeAndIds() {
    var mockedDateGenerator = mock(DateGenerator.class);
    Date fixedDate = Date.from(Instant.parse("2023-05-24T19:33:06Z"));
    when(mockedDateGenerator.newDate()).thenReturn(fixedDate);

    HL7Converter hl7Converter = new HL7Converter(uuidGenerator, dateGenerator);
    BulkUploadResultsToHL7 localSut =
        new BulkUploadResultsToHL7(
            hl7Converter, gitProperties, mockedDateGenerator, resultsUploaderCachingService);

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = localSut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String fhs = getSegmentLine(lines, "FHS");
    String bhs = getSegmentLine(lines, "BHS");

    assertThat(fhs).isNotNull();
    assertThat(bhs).isNotNull();

    // second index should be encoding chars
    assertThat(fhs.split("\\|")[1]).isEqualTo("^~\\&");
    assertThat(bhs.split("\\|")[1]).isEqualTo("^~\\&");

    // should include APHL OID
    String aphlOid = "2.16.840.1.113883.3.8589";
    assertThat(fhs).contains(aphlOid);
    assertThat(bhs).contains(aphlOid);

    // datetime should equal HL7-formatted value from DateTimeUtils
    String[] fhsFields = fhs.split("\\|");
    String[] bhsFields = bhs.split("\\|");
    String expectedHl7Date = DateTimeUtils.formatToHL7DateTime(fixedDate);
    assertThat(fhsFields[fhsFields.length - 1]).isEqualTo(expectedHl7Date);
    assertThat(bhsFields[bhsFields.length - 1]).isEqualTo(expectedHl7Date);
  }

  @Test
  void batchTrailerCounts_matchRecordCount() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String bts = getSegmentLine(lines, "BTS");
    String fts = getSegmentLine(lines, "FTS");

    assertThat(bts).isNotNull();
    assertThat(fts).isNotNull();
    // BTS is the count of messages; FTS is the number of batches (always 1)
    assertThat(bts).isEqualTo("BTS|" + batchMessage.recordsCount());
    assertThat(fts).isEqualTo("FTS|1");
  }

  @Test
  void msh_containsProcessingModeCode() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String msh = getSegmentLine(lines, "MSH");

    assertThat(msh).isNotNull();
    assertThat(msh).containsPattern("\\|T\\|");
  }

  @Test
  void obx_containsSnomedCodedResult() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String obxLine = getSegmentLine(lines, "OBX");
    assertThat(obxLine).isNotNull();

    // OBX CWE should contain a SNOMED code (9 or 15 digits)
    assertThat(obxLine).containsPattern("\\b(\\d{9}|\\d{15})\\b");
  }

  @Test
  void fhsAndBhs_includeSendingFacilityClia() throws IOException {
    var mappingIterator =
        getIteratorForCsv(loadCsv("testResultUpload/test-results-upload-valid.csv"));
    var csvRow = mappingIterator.next();
    var facilityName = csvRow.get("testing_lab_name");
    var facilityClia = csvRow.get("testing_lab_clia");

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String fhs = getSegmentLine(lines, "FHS");
    String bhs = getSegmentLine(lines, "BHS");
    assertThat(fhs).isNotNull();
    assertThat(bhs).isNotNull();

    // sending facility is an HD of name^CLIA^CLIA
    String expectedHdPart = facilityName + "^" + facilityClia + "^CLIA";
    assertThat(fhs).contains(expectedHdPart);
    assertThat(bhs).contains(expectedHdPart);
  }

  @Test
  void pid_containsPatientNameFromCsv() throws IOException {
    var mappingIterator =
        getIteratorForCsv(loadCsv("testResultUpload/test-results-upload-valid.csv"));
    var csvRow = mappingIterator.next();
    var firstName = csvRow.get("patient_first_name");
    var lastName = csvRow.get("patient_last_name");

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String pid = getSegmentLine(lines, "PID");
    assertThat(pid).isNotNull();

    // patient name should appear in PID (formatted as Last^First^Middle)
    assertThat(pid).contains(firstName);
    assertThat(pid).contains(lastName);
  }

  @Test
  void spm_datesPopulated_whenInputDatesBlank() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-blank-dates.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = getHL7Lines(batchMessage);
    String spm = getSegmentLine(lines, "SPM");
    assertThat(spm).isNotNull();

    String[] spmFields = spm.split("\\|");
    assertThat(spmFields.length).isGreaterThan(18);

    assertThat(spmFields[17]).isNotBlank();
    assertThat(spmFields[18]).isNotBlank();
  }

  private InputStream loadCsv(String csvFile) {
    return getClass().getClassLoader().getResourceAsStream(csvFile);
  }

  private String[] getHL7Lines(HL7BatchMessage batchMessage) {
    return batchMessage.message().replace("\r", "\n").split("\n");
  }

  private boolean hasSegment(String[] lines, String segmentType) {
    return Arrays.stream(lines).anyMatch(line -> line.startsWith(segmentType));
  }

  private String getSegmentLine(String[] lines, String segmentType) {
    return Arrays.stream(lines).filter(l -> l.startsWith(segmentType)).findFirst().orElse(null);
  }
}
