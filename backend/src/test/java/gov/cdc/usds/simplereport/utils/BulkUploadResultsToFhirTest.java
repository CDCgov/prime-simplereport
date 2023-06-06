package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.test_util.JsonTestUtils.assertJsonFieldsEqual;
import static gov.cdc.usds.simplereport.test_util.JsonTestUtils.readJsonStream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.service.ResultsUploaderDeviceValidationService;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Observation;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.info.GitProperties;

public class BulkUploadResultsToFhirTest {
  private static GitProperties gitProperties;
  private static ResultsUploaderDeviceValidationService resultsUploaderDeviceValidationService;
  private static UUIDGenerator uuidGenerator;
  private static DateGenerator dateGenerator;
  private static final Instant commitTime = (new Date(1675891986000L)).toInstant();
  final FhirContext ctx = FhirContext.forR4();
  final IParser parser = ctx.newJsonParser();

  BulkUploadResultsToFhir sut;

  @BeforeAll
  public static void init() {
    gitProperties = mock(GitProperties.class);

    when(gitProperties.getCommitTime()).thenReturn(commitTime);
    when(gitProperties.getShortCommitId()).thenReturn("short-commit-id");
  }

  @BeforeEach
  public void beforeEach() {
    resultsUploaderDeviceValidationService = mock(ResultsUploaderDeviceValidationService.class);
    sut = new BulkUploadResultsToFhir(resultsUploaderDeviceValidationService, gitProperties);
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

    verify(resultsUploaderDeviceValidationService, times(1))
        .getModelAndTestPerformedCodeToDeviceMap();
    assertThat(serializedBundles).hasSize(1);
    assertThat(deserializedBundle.getEntry()).hasSize(14);
    assertThat(resourceUrls).hasSize(14);
  }

  @Test
  void convertExistingCsv_aoeQuestionsMapped() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-aoe.csv");
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
    when(resultsUploaderDeviceValidationService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("id now|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

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

  @Test
  void convertExistingCsv_matchesFhirJson()
      throws IOException, NoSuchFieldException, IllegalAccessException, ParseException {
    // Configure mocks for random UUIDs and Date timestamp
    try (MockedStatic<UUIDGenerator> mockedUUIDGenerator = mockStatic(UUIDGenerator.class)) {
      try (MockedStatic<DateGenerator> mockedDateGenerator = mockStatic(DateGenerator.class)) {
        mockedUUIDGenerator
            .when(UUIDGenerator::randomUUID)
            .thenReturn(UUID.fromString("10000000-0000-0000-0000-000000000001"))
            .thenReturn(UUID.fromString("20000000-0000-0000-0000-000000000002"))
            .thenReturn(UUID.fromString("30000000-0000-0000-0000-000000000003"))
            .thenReturn(UUID.fromString("40000000-0000-0000-0000-000000000004"))
            .thenReturn(UUID.fromString("50000000-0000-0000-0000-000000000005"))
            .thenReturn(UUID.fromString("60000000-0000-0000-0000-000000000006"))
            .thenReturn(UUID.fromString("70000000-0000-0000-0000-000000000007"));

        // Construct UTC date object
        String dateString = "2023-05-24T15:33:06.472-04:00";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        Date date = sdf.parse(dateString);
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
        Date finalDate = calendar.getTime();

        mockedDateGenerator.when(DateGenerator::newDate).thenReturn(finalDate);

        sut = new BulkUploadResultsToFhir(resultsUploaderDeviceValidationService, gitProperties);

        when(resultsUploaderDeviceValidationService.getModelAndTestPerformedCodeToDeviceMap())
            .thenReturn(Map.of("id now|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

        InputStream csvStream = loadCsv("testResultUpload/test-results-upload-valid.csv");

        String actualBundleString;
        var serializedBundles =
            sut.convertToFhirBundles(
                csvStream, UUID.fromString("12345000-0000-0000-0000-000000000001"));
        actualBundleString = serializedBundles.get(0);

        InputStream jsonStream =
            getJsonStream("testResultUpload/test-results-upload-valid-as-fhir.json");
        String expectedBundleString = readJsonStream(jsonStream);

        var objectMapper = new ObjectMapper();
        var expectedNode = objectMapper.readTree(expectedBundleString);
        var actualNode = objectMapper.readTree(actualBundleString);

        HashSet<String> ignoredFields = new HashSet<>();

        assertJsonFieldsEqual(expectedNode, actualNode, "", ignoredFields);
      }
    }
  }

  @Test
  void convertExistingCsv_meetsProcessingSpeed() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-5000-rows.csv");

    when(resultsUploaderDeviceValidationService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("id now|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

    var startTime = System.currentTimeMillis();

    var serializedBundles = sut.convertToFhirBundles(input, UUID.randomUUID());

    var endTime = System.currentTimeMillis();
    var elapsedTime = endTime - startTime;

    assertTrue(elapsedTime < 10000, "Bundle processing took more than 10 seconds for 5000 rows");
  }

  //  @Test
  //  void mockStaticTest() {
  //    try (MockedStatic<UUIDGenerator> mockedUUIDGenerator = mockStatic(UUIDGenerator.class)){
  //      try (MockedStatic<DateGenerator> mockedDateGenerator = mockStatic(DateGenerator.class)){
  //
  // mockedUUIDGenerator.when(UUIDGenerator::randomUUID).thenReturn(UUID.fromString("10000000-0000-0000-0000-000000000001"))
  //                .thenReturn(UUID.fromString("20000000-0000-0000-0000-000000000002"))
  //                .thenReturn(UUID.fromString("30000000-0000-0000-0000-000000000003"))
  //                .thenReturn(UUID.fromString("40000000-0000-0000-0000-000000000004"))
  //                .thenReturn(UUID.fromString("50000000-0000-0000-0000-000000000005"))
  //                .thenReturn(UUID.fromString("60000000-0000-0000-0000-000000000006"))
  //                .thenReturn(UUID.fromString("70000000-0000-0000-0000-000000000007"));
  //      }
  //
  //      var test = UUIDGenerator.randomUUID();
  //
  //      assertThat(test).isEqualTo(UUID.fromString("10000000-0000-0000-0000-000000000001"));
  //
  //    }
  //  }
}
