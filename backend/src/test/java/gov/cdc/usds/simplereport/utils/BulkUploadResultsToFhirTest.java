package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.test_util.JsonTestUtils.assertJsonNodesEqual;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.service.ResultsUploaderDeviceValidationService;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;
import java.util.stream.Collectors;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Observation;
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
  private static ResultsUploaderDeviceValidationService resultsUploaderDeviceValidationService;
  private static final Instant commitTime = (new Date(1675891986000L)).toInstant();
  final FhirContext ctx = FhirContext.forR4();
  final IParser parser = ctx.newJsonParser();
  private UUIDGenerator uuidGenerator = new UUIDGenerator();
  private DateGenerator dateGenerator = new DateGenerator();

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
    FhirConverter fhirConverter = new FhirConverter(uuidGenerator);
    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderDeviceValidationService,
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

  private String readJsonStream(InputStream is) throws IOException {
    BufferedReader reader = new BufferedReader(new InputStreamReader(is));
    StringBuilder stringBuilder = new StringBuilder();
    String line;
    while ((line = reader.readLine()) != null) {
      stringBuilder.append(line);
    }
    return stringBuilder.toString();
  }

  @Test
  void convertExistingCsv_matchesFhirJson() throws IOException, ParseException {
    // Configure mocks for random UUIDs and Date timestamp
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

    // Construct UTC date object
    String dateString = "2023-05-24T15:33:06.472-04:00";
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    Date date = sdf.parse(dateString);
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(date);
    calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
    Date finalDate = calendar.getTime();

    var mockedDateGenerator = mock(DateGenerator.class);
    when(mockedDateGenerator.newDate()).thenReturn(finalDate);

    sut =
        new BulkUploadResultsToFhir(
            resultsUploaderDeviceValidationService,
            gitProperties,
            mockedUUIDGenerator,
            mockedDateGenerator,
            new FhirConverter(mockedUUIDGenerator));

    when(resultsUploaderDeviceValidationService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("id now|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

    InputStream csvStream = loadCsv("testResultUpload/test-results-upload-valid.csv");

    String actualBundleString;
    var serializedBundles =
        sut.convertToFhirBundles(
            csvStream, UUID.fromString("12345000-0000-0000-0000-000000000000"));
    actualBundleString = serializedBundles.get(0);

    InputStream jsonStream =
        getJsonStream("testResultUpload/test-results-upload-valid-as-fhir.json");
    String expectedBundleString = readJsonStream(jsonStream);

    var objectMapper = new ObjectMapper();
    var expectedNode = objectMapper.readTree(expectedBundleString);
    var actualNode = objectMapper.readTree(actualBundleString);

    assertJsonNodesEqual(expectedNode, actualNode);
  }

  @Test
  void convertExistingCsv_meetsProcessingSpeed() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-5000-rows.csv");

    when(resultsUploaderDeviceValidationService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("id now|94534-5", TestDataBuilder.createDeviceTypeForBulkUpload()));

    var startTime = System.currentTimeMillis();

    sut.convertToFhirBundles(input, UUID.randomUUID());

    var endTime = System.currentTimeMillis();
    var elapsedTime = endTime - startTime;

    assertTrue(elapsedTime < 20000, "Bundle processing took more than 20 seconds for 5000 rows");
  }
}
