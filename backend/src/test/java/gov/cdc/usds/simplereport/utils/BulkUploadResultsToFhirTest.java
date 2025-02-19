package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.test_util.JsonTestUtils.assertJsonNodesEqual;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartystreets.api.exceptions.SmartyException;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.db.model.auxiliary.FHIRBundleRecord;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.DateTimeType;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.Specimen;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.stubbing.Answer;
import org.springframework.boot.info.GitProperties;

@Slf4j
@ExtendWith(MockitoExtension.class)
public class BulkUploadResultsToFhirTest {
  private static GitProperties gitProperties;
  private static ResultsUploaderCachingService resultsUploaderCachingService;
  private static final Instant commitTime = (new Date(1675891986000L)).toInstant();
  final FhirContext ctx = FhirContext.forR4();
  final IParser parser = ctx.newJsonParser();
  private final UUIDGenerator uuidGenerator = new UUIDGenerator();
  private final DateGenerator dateGenerator = new DateGenerator();
  BulkUploadResultsToFhir sut;

  @BeforeAll
  public static void init() throws SmartyException, IOException, InterruptedException {
    gitProperties = mock(GitProperties.class);

    when(gitProperties.getCommitTime()).thenReturn(commitTime);
    when(gitProperties.getShortCommitId()).thenReturn("short-commit-id");
  }

  @BeforeEach
  public void beforeEach() {
    resultsUploaderCachingService = mock(ResultsUploaderCachingService.class);

    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("id now|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

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

    when(resultsUploaderCachingService.getZoneIdByAddress(any()))
        .thenReturn(ZoneId.of("US/Central"));

    FhirConverter fhirConverter = new FhirConverter(uuidGenerator, dateGenerator);
    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderCachingService,
            gitProperties,
            uuidGenerator,
            dateGenerator,
            fhirConverter);
  }

  @Test
  void convertExistingCsv_success() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();

    var first = serializedBundles.get(0);
    var deserializedBundle = (Bundle) parser.parseResource(first);
    var resourceUrls =
        deserializedBundle.getEntry().stream()
            .map(Bundle.BundleEntryComponent::getFullUrl)
            .collect(Collectors.toList());

    verify(resultsUploaderCachingService, times(2)).getModelAndTestPerformedCodeToDeviceMap();
    assertThat(serializedBundles).hasSize(1);
    assertThat(deserializedBundle.getEntry()).hasSize(19);
    assertThat(resourceUrls).hasSize(19);
  }

  @Test
  void allFieldsCsv_TestOrderedCodeMapped() throws IOException {
    byte[] input = loadCsv("testResultUpload/test-results-upload-all-fields.csv").readAllBytes();
    FHIRBundleRecord bundleRecord =
        sut.convertToFhirBundles(new ByteArrayInputStream(input), UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();
    var mappingIterator = getIteratorForCsv(new ByteArrayInputStream(input));

    int index = 0;
    while (mappingIterator.hasNext()) {
      var csvRow = mappingIterator.next();
      var inputOrderedCode = csvRow.get("test_ordered_code");
      var inputPerformedCode = csvRow.get("test_performed_code");

      var bundle = serializedBundles.get(index++);
      var deserializedBundle = (Bundle) parser.parseResource(bundle);

      var serviceRequestEntry =
          deserializedBundle.getEntry().stream()
              .filter(entry -> entry.getFullUrl().contains("ServiceRequest/"))
              .findFirst()
              .orElseThrow(
                  () -> new AssertionError("Expected to find ServiceRequest, but not found"));
      var serviceRequest = (ServiceRequest) serviceRequestEntry.getResource();

      var mappedCode = serviceRequest.getCode().getCoding().stream().findFirst().get().getCode();

      // value is mapped
      assertThat(mappedCode).isEqualTo(inputOrderedCode);
      // value is not defaulted to performed code
      assertThat(inputOrderedCode).isNotEqualTo(inputPerformedCode);
    }
  }

  @Test
  void validCsv_TestOrderedCodeDefaultedToPerformedCode() throws IOException {
    byte[] input = loadCsv("testResultUpload/test-results-upload-valid.csv").readAllBytes();

    FHIRBundleRecord bundleRecord =
        sut.convertToFhirBundles(new ByteArrayInputStream(input), UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();

    var mappingIterator = getIteratorForCsv(new ByteArrayInputStream(input));

    int index = 0;
    while (mappingIterator.hasNext()) {
      var csvRow = mappingIterator.next();
      var inputOrderedCode = csvRow.get("test_ordered_code");
      var inputPerformedCode = csvRow.get("test_performed_code");

      var bundle = serializedBundles.get(index++);
      var deserializedBundle = (Bundle) parser.parseResource(bundle);

      var serviceRequestEntry =
          deserializedBundle.getEntry().stream()
              .filter(entry -> entry.getFullUrl().contains("ServiceRequest/"))
              .findFirst()
              .orElseThrow(
                  () -> new AssertionError("Expected to find ServiceRequest, but not found"));
      var serviceRequest = (ServiceRequest) serviceRequestEntry.getResource();

      var mappedCode = serviceRequest.getCode().getCoding().stream().findFirst().get().getCode();

      // when supplied orderedCode is empty
      assertThat(inputOrderedCode).isEmpty();
      // value is defaulted to performed code
      assertThat(mappedCode).isEqualTo(inputPerformedCode);
    }
  }

  @Test
  void convertExistingCsv_aoeQuestionsMapped() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-all-fields.csv");
    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();

    var asymptomaticNotCongregateSettingEntry = serializedBundles.get(0);
    var deserializedAsymptomaticNotCongregateEntry =
        (Bundle) parser.parseResource(asymptomaticNotCongregateSettingEntry);
    var asymptomaticNotCongregateObservations =
        deserializedAsymptomaticNotCongregateEntry.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/"))
            .toList();
    var asymptomaticNotCongregateAOE =
        asymptomaticNotCongregateObservations.stream()
            .filter(
                observation -> observation.getResource().getNamedProperty("identifier").hasValues())
            .toList();
    assertThat(asymptomaticNotCongregateAOE).hasSize(12);

    var symptomaticCongregateSettingEntry = serializedBundles.get(1);
    var deserializedSymptomaticCongregateEntry =
        (Bundle) parser.parseResource(symptomaticCongregateSettingEntry);
    var symptomaticCongregateObservations =
        deserializedSymptomaticCongregateEntry.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/"))
            .toList();
    var symptomaticCongregateAOE =
        symptomaticCongregateObservations.stream()
            .filter(obs -> obs.getResource().getNamedProperty("identifier").hasValues())
            .toList();
    assertThat(symptomaticCongregateAOE).hasSize(11);
  }

  private InputStream loadCsv(String csvFile) {
    return BulkUploadResultsToFhirTest.class.getClassLoader().getResourceAsStream(csvFile);
  }

  @Test
  void convertExistingCsv_observationValuesPresent() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();

    var first = serializedBundles.get(0);
    var deserializedBundle = (Bundle) parser.parseResource(first);
    var observations =
        deserializedBundle.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/"))
            .map(observation -> (Observation) observation.getResource())
            .toList();

    observations.forEach(
        observation -> {
          // could be AOE or Covid/flu
          assertThat(observation.getCode().getText()).isNotEmpty();
          assertThat(observation.getSubject().getReference()).isNotEmpty();
        });

    assertThat(serializedBundles).hasSize(1);
    assertThat(deserializedBundle.getEntry()).hasSize(19);
  }

  private InputStream getJsonStream(String jsonFile) {
    return BulkUploadResultsToFhirTest.class.getClassLoader().getResourceAsStream(jsonFile);
  }

  private String inputStreamToString(InputStream inputStream) throws IOException {
    return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
  }

  @Test
  void convertExistingCsv_matchesFhirJson() throws IOException {
    // Mock random UUIDs
    var mockedUUIDGenerator = mock(UUIDGenerator.class);
    when(mockedUUIDGenerator.randomUUID())
        .thenAnswer(
            new Answer<UUID>() {
              private long counter = 1;

              @Override
              public UUID answer(InvocationOnMock invocation) {
                counter++;
                String counterPadded = String.format("%32s", counter).replace(' ', '0');
                String uuid =
                    counterPadded.substring(0, 8)
                        + "-"
                        + counterPadded.substring(8, 12)
                        + "-"
                        + counterPadded.substring(12, 16)
                        + "-"
                        + counterPadded.substring(16, 20)
                        + "-"
                        + counterPadded.substring(20, 32);
                return UUID.fromString(uuid);
              }
            });

    // Mock constructed UTC date object
    var mockedDateGenerator = mock(DateGenerator.class);
    when(mockedDateGenerator.newDate())
        .thenReturn(Date.from(Instant.parse("2023-05-24T19:33:06.472Z")));

    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderCachingService,
            gitProperties,
            mockedUUIDGenerator,
            mockedDateGenerator,
            new FhirConverter(mockedUUIDGenerator, mockedDateGenerator));

    InputStream csvStream = loadCsv("testResultUpload/test-results-upload-valid.csv");

    FHIRBundleRecord bundleRecord =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
    var serializedBundles = bundleRecord.serializedBundle();
    String actualBundleString = serializedBundles.get(0);

    InputStream jsonStream =
        getJsonStream("testResultUpload/test-results-upload-valid-as-fhir.json");
    String expectedBundleString = inputStreamToString(jsonStream);

    var objectMapper = new ObjectMapper();
    var expectedNode = objectMapper.readTree(expectedBundleString);
    var actualNode = objectMapper.readTree(actualBundleString);

    assertJsonNodesEqual(expectedNode, actualNode);
  }

  @Test
  void convertExistingCsv_matchesFhir_with_specimenType_LOINC() throws IOException {
    // Mock random UUIDs
    var mockedUUIDGenerator = mock(UUIDGenerator.class);
    when(mockedUUIDGenerator.randomUUID())
        .thenAnswer(
            (Answer<UUID>) invocation -> UUID.fromString("5db534ea-5e97-4861-ba18-d74acc46db15"));

    // Mock constructed UTC date object
    var mockedDateGenerator = mock(DateGenerator.class);
    when(mockedDateGenerator.newDate())
        .thenReturn(Date.from(Instant.parse("2023-05-24T19:33:06.472Z")));

    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderCachingService,
            gitProperties,
            mockedUUIDGenerator,
            mockedDateGenerator,
            new FhirConverter(mockedUUIDGenerator, mockedDateGenerator));

    InputStream csvStream =
        loadCsv("testResultUpload/test-results-upload-valid-with-specimenType-loinc.csv");

    FHIRBundleRecord bundleRecord =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
    var serializedBundles = bundleRecord.serializedBundle();

    String actualBundles = String.join("\n", serializedBundles);

    InputStream jsonStream =
        getJsonStream("testResultUpload/fhir-for-csv-with-specimenType-loinc.ndjson");
    String expectedBundleString = inputStreamToString(jsonStream);

    assertThat(actualBundles).isEqualToIgnoringWhitespace(expectedBundleString);
  }

  @Test
  void convertExistingCsv_matchesFhir_with_comments() throws IOException {
    // Mock random UUIDs
    var mockedUUIDGenerator = mock(UUIDGenerator.class);
    when(mockedUUIDGenerator.randomUUID())
        .thenAnswer(
            (Answer<UUID>) invocation -> UUID.fromString("5db534ea-5e97-4861-ba18-d74acc46db15"));

    // Mock constructed UTC date object
    var mockedDateGenerator = mock(DateGenerator.class);
    when(mockedDateGenerator.newDate())
        .thenReturn(Date.from(Instant.parse("2023-05-24T19:33:06.472Z")));

    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderCachingService,
            gitProperties,
            mockedUUIDGenerator,
            mockedDateGenerator,
            new FhirConverter(mockedUUIDGenerator, mockedDateGenerator));

    InputStream csvStream = loadCsv("testResultUpload/test-results-upload-valid-with-comments.csv");

    FHIRBundleRecord bundleRecord =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
    var serializedBundles = bundleRecord.serializedBundle();
    String actualBundles = String.join("\n", serializedBundles);

    InputStream jsonStream = getJsonStream("testResultUpload/fhir-for-csv-with-comments.ndjson");
    String expectedBundleString = inputStreamToString(jsonStream);

    assertThat(actualBundles).isEqualToIgnoringWhitespace(expectedBundleString);
  }

  @Test
  void convertExistingCsv_matchesFhir_with_flu_only() throws IOException {
    // Mock random UUIDs
    var mockedUUIDGenerator = mock(UUIDGenerator.class);
    when(mockedUUIDGenerator.randomUUID())
        .thenAnswer(
            (Answer<UUID>) invocation -> UUID.fromString("5db534ea-5e97-4861-ba18-d74acc46db15"));

    // Mock constructed UTC date object
    var mockedDateGenerator = mock(DateGenerator.class);
    when(mockedDateGenerator.newDate())
        .thenReturn(Date.from(Instant.parse("2023-05-24T19:33:06.472Z")));

    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderCachingService,
            gitProperties,
            mockedUUIDGenerator,
            mockedDateGenerator,
            new FhirConverter(mockedUUIDGenerator, mockedDateGenerator));

    InputStream csvStream = loadCsv("testResultUpload/test-results-upload-valid-flu-only.csv");

    FHIRBundleRecord bundleRecord =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
    var serializedBundles = bundleRecord.serializedBundle();
    String actualBundles = String.join("\n", serializedBundles);

    InputStream jsonStream = getJsonStream("testResultUpload/fhir-for-csv-with-flu-only.ndjson");
    String expectedBundleString = inputStreamToString(jsonStream);

    assertThat(actualBundles).isEqualToIgnoringWhitespace(expectedBundleString);
  }

  @Test
  void convertExistingCsv_matchesFhir_NDJson() throws IOException {
    // Mock random UUIDs
    var mockedUUIDGenerator = mock(UUIDGenerator.class);
    when(mockedUUIDGenerator.randomUUID())
        .thenAnswer(
            (Answer<UUID>) invocation -> UUID.fromString("5db534ea-5e97-4861-ba18-d74acc46db15"));

    // Mock constructed UTC date object
    var mockedDateGenerator = mock(DateGenerator.class);
    when(mockedDateGenerator.newDate())
        .thenReturn(Date.from(Instant.parse("2023-05-24T19:33:06.472Z")));

    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderCachingService,
            gitProperties,
            mockedUUIDGenerator,
            mockedDateGenerator,
            new FhirConverter(mockedUUIDGenerator, mockedDateGenerator));

    InputStream csvStream =
        loadCsv("testResultUpload/test-results-upload-valid-different-results.csv");

    FHIRBundleRecord bundleRecord =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
    var serializedBundles = bundleRecord.serializedBundle();
    String actualBundles = String.join("\n", serializedBundles);

    InputStream jsonStream =
        getJsonStream("testResultUpload/test-results-upload-valid-as-fhir.ndjson");
    String expectedBundleString = inputStreamToString(jsonStream);
    assertThat(actualBundles).isEqualTo(expectedBundleString);
  }

  @Test
  void convertExistingCsv_meetsProcessingSpeed() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-5000-rows.csv");

    var startTime = System.currentTimeMillis();

    sut.convertToFhirBundles(input, UUID.randomUUID());

    var endTime = System.currentTimeMillis();
    var elapsedTime = endTime - startTime;

    // The processing is threaded so the elapsed time is closely tied to available CPU cores. GitHub
    // action runners
    // will require more time because they have less cores than our dev or prod machines.
    String msg =
        "Bundle processing took more than 30 seconds for 5000 rows. It took "
            + elapsedTime
            + " milliseconds.";
    log.info(msg);
    assertTrue(elapsedTime < 30000, msg);
  }

  @Test
  void convertExistingCsv_populatesBlankFields() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-blank-dates.csv");
    var orderTestDate = Instant.parse("2021-12-20T04:00:00-07:00");
    var testResultDate = Instant.parse("2021-12-23T14:00:00-06:00");

    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();
    var first = serializedBundles.get(0);
    var deserializedBundle = (Bundle) parser.parseResource(first);

    var specimen =
        (Specimen)
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("Specimen/"))
                .findFirst()
                .get()
                .getResource();

    var diagnosticReport =
        (DiagnosticReport)
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("DiagnosticReport/"))
                .findFirst()
                .get()
                .getResource();

    var organizations =
        new java.util.ArrayList<>(
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("Organization/"))
                .map(org -> (Organization) org.getResource())
                .toList());

    organizations.removeIf(org -> org.hasName() && org.getName().equals("SimpleReport"));

    // Order test date should populate specimen collection date (aka collected)
    assertThat(((DateTimeType) specimen.getCollection().getCollected()).getValue())
        .isEqualTo(orderTestDate);
    // Order test date should populate testing lab specimen received date (aka received time)
    assertThat(specimen.getReceivedTime()).isEqualTo(orderTestDate);
    // Test result date should populate date result released (aka issued)
    assertThat(diagnosticReport.getIssued()).isEqualTo(testResultDate);
    // Testing lab should populate ordering facility
    assertThat(organizations).hasSize(2);
    assertThat(organizations.get(0).getAddress()).hasSize(1);
    assertThat(organizations.get(1).getAddress()).hasSize(1);
    assertThat(organizations.get(0).getAddress().get(0).getLine().get(0))
        .hasToString(organizations.get(1).getAddress().get(0).getLine().get(0).toString());
    assertThat(organizations.get(0).getAddress().get(0).getCity())
        .isEqualTo(organizations.get(1).getAddress().get(0).getCity());
    assertThat(organizations.get(0).getAddress().get(0).getState())
        .isEqualTo(organizations.get(1).getAddress().get(0).getState());
    assertThat(organizations.get(0).getAddress().get(0).getPostalCode())
        .isEqualTo(organizations.get(1).getAddress().get(0).getPostalCode());
  }

  @Test
  void convertExistingCsv_setsOrderingProviderTimezone_forNoTimezoneInDates() {
    ZoneId zoneId = ZoneId.of("US/Mountain");
    when(resultsUploaderCachingService.getZoneIdByAddress(any())).thenReturn(zoneId);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-dates-no-timezone.csv");

    Instant orderTestDate = ZonedDateTime.of(2021, 12, 19, 12, 0, 0, 0, zoneId).toInstant();
    Instant specimenCollectionDate =
        ZonedDateTime.of(2021, 12, 20, 12, 0, 0, 0, zoneId).toInstant();
    Instant testResultDate = ZonedDateTime.of(2021, 12, 23, 12, 0, 0, 0, zoneId).toInstant();

    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();
    var first = serializedBundles.get(0);
    var deserializedBundle = (Bundle) parser.parseResource(first);

    var specimen =
        (Specimen)
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("Specimen/"))
                .findFirst()
                .get()
                .getResource();

    var diagnosticReport =
        (DiagnosticReport)
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("DiagnosticReport/"))
                .findFirst()
                .get()
                .getResource();
    assertThat(((DateTimeType) specimen.getCollection().getCollected()).getValue())
        .isEqualTo(specimenCollectionDate);
    assertThat(specimen.getReceivedTime()).isEqualTo(orderTestDate);
    assertThat(diagnosticReport.getIssued()).isEqualTo(testResultDate);
  }

  @Test
  void convertExistingCsv_setsEasternTimeDefaultTimeZone_forIncorrectOrderingProviderAddress() {
    ZoneId zoneId = ZoneId.of("US/Eastern");
    // mock invalid address response
    when(resultsUploaderCachingService.getZoneIdByAddress(any())).thenReturn(null);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-dates-no-timezone.csv");

    Instant orderTestDate = ZonedDateTime.of(2021, 12, 19, 12, 0, 0, 0, zoneId).toInstant();
    Instant specimenCollectionDate =
        ZonedDateTime.of(2021, 12, 20, 12, 0, 0, 0, zoneId).toInstant();
    Instant testResultDate = ZonedDateTime.of(2021, 12, 23, 12, 0, 0, 0, zoneId).toInstant();

    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();
    var first = serializedBundles.get(0);
    var deserializedBundle = (Bundle) parser.parseResource(first);

    var specimen =
        (Specimen)
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("Specimen/"))
                .findFirst()
                .get()
                .getResource();

    var diagnosticReport =
        (DiagnosticReport)
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("DiagnosticReport/"))
                .findFirst()
                .get()
                .getResource();
    assertThat(((DateTimeType) specimen.getCollection().getCollected()).getValue())
        .isEqualTo(specimenCollectionDate);
    assertThat(specimen.getReceivedTime()).isEqualTo(orderTestDate);
    assertThat(diagnosticReport.getIssued()).isEqualTo(testResultDate);
  }

  @Test
  void convertExistingCsv_validHivPositive_withAOEdataColumns() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-hiv-only.csv");

    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    var serializedBundles = bundleRecord.serializedBundle();
    var first = serializedBundles.get(0);
    var deserializedBundle = (Bundle) parser.parseResource(first);

    var gendersOfSexualPartnersObservations =
        (List<Observation>)
            deserializedBundle.getEntry().stream()
                .filter(entry -> entry.getFullUrl().contains("Observation/"))
                .map(x -> (Observation) x.getResource())
                .filter(
                    x ->
                        Objects.equals(
                            x.getCode().getText(), "What is the gender of their sexual partners"))
                .collect(Collectors.toList());

    List<String> codeableConceptValues =
        gendersOfSexualPartnersObservations.stream()
            .map(x -> x.getValueCodeableConcept().getCoding().get(0).getDisplay())
            .collect(Collectors.toList());

    List<String> expectedGenders = new ArrayList<>();
    expectedGenders.add("Non-binary gender identity");
    expectedGenders.add("Female gender identity");
    expectedGenders.add("Male gender identity");
    expectedGenders.add("Female gender identity");
    expectedGenders.add("Male gender identity");

    assertThat(gendersOfSexualPartnersObservations).hasSize(5);
    assertThat(codeableConceptValues).containsExactlyInAnyOrderElementsOf(expectedGenders);
  }

  @Test
  void convertExistingCsv_validSyphilisPositive_withAOEdataColumns() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-syphilis-only.csv");

    FHIRBundleRecord bundleRecord = sut.convertToFhirBundles(input, UUID.randomUUID());
    List<String> serializedBundles = bundleRecord.serializedBundle();
    String first = serializedBundles.get(0);
    Bundle deserializedBundle = (Bundle) parser.parseResource(first);

    List<Observation> syphilisHistoryObservations =
        deserializedBundle.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/"))
            .map(x -> (Observation) x.getResource())
            .filter(x -> Objects.equals(x.getCode().getText(), "History of syphilis"))
            .collect(Collectors.toList());

    List<String> codeableConceptValues =
        syphilisHistoryObservations.stream()
            .map(x -> x.getValueCodeableConcept().getCoding().get(0).getDisplay())
            .collect(Collectors.toList());

    assertThat(syphilisHistoryObservations).hasSize(1);
    assertThat(codeableConceptValues).isEqualTo(List.of("unknown"));
  }
}
