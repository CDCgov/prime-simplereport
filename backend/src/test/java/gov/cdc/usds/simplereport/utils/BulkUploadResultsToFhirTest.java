package gov.cdc.usds.simplereport.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.InputStream;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Observation;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.info.GitProperties;

public class BulkUploadResultsToFhirTest {
  private static GitProperties gitProperties;
  private static DeviceTypeRepository repo;
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
    repo = spy(DeviceTypeRepository.class);
    sut = new BulkUploadResultsToFhir(repo, gitProperties);
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

    verify(repo, times(1)).findAllByIsDeletedFalse();
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
    when(repo.findAllByIsDeletedFalse())
        .thenReturn(TestDataBuilder.createDeviceTypeListWithDeviceTypeDisease());

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

    verify(repo, times(1)).findAllByIsDeletedFalse();
    assertThat(serializedBundles).hasSize(1);
    assertThat(deserializedBundle.getEntry()).hasSize(14);
  }
}
