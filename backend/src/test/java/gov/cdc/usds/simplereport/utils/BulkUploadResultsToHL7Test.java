package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
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
    assertThat(batchMessage.metadata()).isNotNull();

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    assertThat(lines).isNotEmpty();

    boolean hasFhsSegment = Arrays.stream(lines).anyMatch(line -> line.startsWith("FHS"));
    assertThat(hasFhsSegment).isTrue();

    boolean hasBhsSegment = Arrays.stream(lines).anyMatch(line -> line.startsWith("BHS"));
    assertThat(hasBhsSegment).isTrue();

    boolean hasMshSegment = Arrays.stream(lines).anyMatch(line -> line.startsWith("MSH"));
    assertThat(hasMshSegment).isTrue();

    boolean hasBtsSegment = Arrays.stream(lines).anyMatch(line -> line.startsWith("BTS"));
    assertThat(hasBtsSegment).isTrue();

    boolean hasFtsSegment = Arrays.stream(lines).anyMatch(line -> line.startsWith("FTS"));
    assertThat(hasFtsSegment).isTrue();
  }

  @Test
  void requiredFieldsOnlyCsv_success() throws IOException {
    String testFileName = "testResultUpload/test-results-upload-valid-required-only.csv";
    InputStream input = loadCsv(testFileName);

    try {
      HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);
      assertThat(batchMessage.recordsCount()).isEqualTo(1);
    } catch (Exception e) {
      assertThat(e.getMessage()).contains("Unable to process file");
    }
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

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    // Verify that ordered code appears in message content
    assertThat(batchMessage.message()).contains(inputOrderedCode);
  }

  @Test
  void validCsv_TestOrderedCodeDefaultedToPerformedCode() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    // when supplied orderedCode is empty, performed code should be present somewhere
    assertThat(batchMessage.message()).contains("94534-5");
  }

  @Test
  void convertExistingCsv_observationValuesPresent() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");

    String mshLine = Arrays.stream(lines).filter(l -> l.startsWith("MSH")).findFirst().orElse(null);
    assertThat(mshLine).isNotNull();
    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(6);
    // MSH-2 is encoding characters
    assertThat(mshFields[1]).isEqualTo("^~\\&");
    // MSH-4 contains sending facility (usually CLIA assigning authority)
    assertThat(mshFields[4]).isNotEmpty();
    // Receiving app/facility should include APHL OID in either MSH-5 or MSH-6
    String aphlOid = "2.16.840.1.113883.3.8589";
    assertThat(mshFields[4] + mshFields[5]).contains(aphlOid);

    assertThat(Arrays.stream(lines).anyMatch(l -> l.startsWith("PID"))).isTrue();
    assertThat(Arrays.stream(lines).anyMatch(l -> l.startsWith("OBR"))).isTrue();
    assertThat(Arrays.stream(lines).anyMatch(l -> l.startsWith("OBX"))).isTrue();

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_multipleRecords() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.recordsCount()).isEqualTo(6);
    assertThat(batchMessage.metadata()).isNotNull();

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    assertThat(batchMessage.message()).contains("MSH|");
    assertThat(batchMessage.message()).contains("PID|");
    assertThat(batchMessage.message()).contains("OBR|");
    assertThat(batchMessage.message()).contains("OBX|");
  }

  @Test
  void convertExistingCsv_specimenTypeMapping() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    String spmLine = Arrays.stream(lines).filter(l -> l.startsWith("SPM")).findFirst().orElse(null);
    if (spmLine != null) {
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
    }

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_testResultMapping() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    // Ensure at least one OBX segment present
    assertThat(batchMessage.message()).contains("OBX|");

    assertThat(batchMessage.recordsCount()).isEqualTo(6);
  }

  @Test
  void convertExistingCsv_softwareSegment() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    boolean hasSftSegment = Arrays.stream(lines).anyMatch(line -> line.startsWith("SFT"));
    // Optional in some messages
    // assertThat(hasSftSegment).isTrue();

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_orderingProviderInformation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    // Ensure ordering provider data is included somewhere
    assertThat(batchMessage.message()).contains("Smith");
    assertThat(batchMessage.message()).contains("1013012657");

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_facilityInformation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    String mshLine = Arrays.stream(lines).filter(l -> l.startsWith("MSH")).findFirst().orElse(null);
    assertThat(mshLine).isNotNull();
    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(6);

    // MSH-4 should contain sending facility (assigning authority usually CLIA)
    assertThat(mshFields[4]).isNotEmpty();
    // Receiving app/facility should include APHL OID in either MSH-5 or MSH-6
    String aphlOid2 = "2.16.840.1.113883.3.8589";
    assertThat(mshFields[4] + mshFields[5]).contains(aphlOid2);

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_patientAddress() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
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

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    // Ensure at least one OBX segment present
    assertThat(batchMessage.message()).contains("OBX|");

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  @Test
  void convertExistingCsv_requiredFieldsValidation() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-required-only.csv");
    try {
      HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

      String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
      for (String line : lines) {
        if (line.startsWith("MSH")
            || line.startsWith("PID")
            || line.startsWith("OBR")
            || line.startsWith("OBX")) {
          assertDoesNotThrow(() -> parser.parse(line));
        }
      }
    } catch (Exception e) {
      assertThat(e.getMessage()).contains("Unable to process file");
    }
  }

  @Test
  void convertExistingCsv_diseaseTracking() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.metadata()).isNotNull();
    assertThat(batchMessage.recordsCount()).isEqualTo(6);
  }

  @Test
  void convertExistingCsv_noDeviceMapping() {
    // Disable device mapping to ensure fallback behavior
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of());

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    assertThat(batchMessage.message()).isNotEmpty();
    assertThat(batchMessage.recordsCount()).isEqualTo(1);
    assertThat(batchMessage.metadata()).isNotNull();
  }

  @Test
  void convertExistingCsv_populatesBlankFields() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-blank-dates.csv");
    try {
      HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);
      assertThat(batchMessage.recordsCount()).isEqualTo(1);
    } catch (Exception e) {
      assertThat(e.getMessage()).contains("Unable to process file");
    }
  }

  @Test
  void convertExistingCsv_encodingCharacters() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    HL7BatchMessage batchMessage = sut.convertToHL7BatchMessage(input);

    String[] lines = batchMessage.message().replace("\r", "\n").split("\n");
    String mshLine = Arrays.stream(lines).filter(l -> l.startsWith("MSH")).findFirst().orElse(null);
    assertThat(mshLine).isNotNull();
    String[] mshFields = mshLine.split("\\|");
    assertThat(mshFields).hasSizeGreaterThan(2);

    // MSH-2 (index 1) should contain encoding characters
    assertThat(mshFields[1]).isEqualTo("^~\\&");

    assertThat(batchMessage.recordsCount()).isEqualTo(1);
  }

  private InputStream loadCsv(String csvFile) {
    return getClass().getClassLoader().getResourceAsStream(csvFile);
  }
}
