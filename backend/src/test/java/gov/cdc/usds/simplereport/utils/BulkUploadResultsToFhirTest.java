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
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
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
                "Nasal swab".toLowerCase(), "445297001",
                "Anterior nares swab".toLowerCase(), "697989009"));

    when(resultsUploaderCachingService.getSNOMEDToSpecimenTypeNameMap())
        .thenReturn(
            Map.of(
                "445297001", "Nasal swab",
                "697989009", "Anterior nares swab"));

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
    var serializedBundles = sut.convertToFhirBundles(input, UUID.randomUUID());

    var first = serializedBundles.get(0);
    var deserializedBundle = (Bundle) parser.parseResource(first);
    var resourceUrls =
        deserializedBundle.getEntry().stream()
            .map(Bundle.BundleEntryComponent::getFullUrl)
            .collect(Collectors.toList());

    verify(resultsUploaderCachingService, times(1)).getModelAndTestPerformedCodeToDeviceMap();
    assertThat(serializedBundles).hasSize(1);
    assertThat(deserializedBundle.getEntry()).hasSize(14);
    assertThat(resourceUrls).hasSize(14);
  }

  @Test
  void allFieldsCsv_TestOrderedCodeMapped() throws IOException {
    byte[] input = loadCsv("testResultUpload/test-results-upload-all-fields.csv").readAllBytes();

    var serializedBundles =
        sut.convertToFhirBundles(new ByteArrayInputStream(input), UUID.randomUUID());
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

    var serializedBundles =
        sut.convertToFhirBundles(new ByteArrayInputStream(input), UUID.randomUUID());
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
    var serializedBundles = sut.convertToFhirBundles(input, UUID.randomUUID());

    var asymptomaticEntry = serializedBundles.get(0);
    var deserializedAsymptomatic = (Bundle) parser.parseResource(asymptomaticEntry);
    var asymptomaticObservations =
        deserializedAsymptomatic.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/"))
            .toList();
    var asymptomaticAOE =
        asymptomaticObservations.stream()
            .filter(
                observation -> observation.getResource().getNamedProperty("identifier").hasValues())
            .toList();
    assertThat(asymptomaticAOE).hasSize(1);

    var symptomaticEntry = serializedBundles.get(1);
    var deserializedSymptomatic = (Bundle) parser.parseResource(symptomaticEntry);
    var symptomaticObservations =
        deserializedSymptomatic.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/"))
            .toList();
    var symptomaticAOE =
        symptomaticObservations.stream()
            .filter(obs -> obs.getResource().getNamedProperty("identifier").hasValues())
            .toList();
    assertThat(symptomaticAOE).hasSize(2);
  }

  private InputStream loadCsv(String csvFile) {
    return BulkUploadResultsToFhirTest.class.getClassLoader().getResourceAsStream(csvFile);
  }

  @Test
  void convertExistingCsv_observationValuesPresent() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");

    var serializedBundles = sut.convertToFhirBundles(input, UUID.randomUUID());

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
    assertThat(deserializedBundle.getEntry()).hasSize(14);
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

    var serializedBundles =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
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

    var serializedBundles =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
    String actualBundles = String.join("\n", serializedBundles);

    InputStream jsonStream =
        getJsonStream("testResultUpload/fhir-for-csv-with-specimenType-loinc.ndjson");
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

    var serializedBundles =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
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

    var serializedBundles =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
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

    assertTrue(elapsedTime < 20000, "Bundle processing took more than 20 seconds for 5000 rows");
  }

  @Test
  void convertExistingCsv_populatesBlankFields() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-blank-dates.csv");
    var orderTestDate = Instant.parse("2021-12-20T04:00:00-07:00");
    var testResultDate = Instant.parse("2021-12-23T14:00:00-06:00");

    var serializedBundles = sut.convertToFhirBundles(input, UUID.randomUUID());
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
}
