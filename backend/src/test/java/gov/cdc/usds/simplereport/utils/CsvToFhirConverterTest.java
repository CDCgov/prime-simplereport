package gov.cdc.usds.simplereport.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import java.io.InputStream;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;
import org.hl7.fhir.r4.model.Bundle;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.info.GitProperties;

public class CsvToFhirConverterTest {

  private static GitProperties gitProperties;
  private static DeviceTypeRepository repo;
  private static final Instant commitTime = (new Date(1675891986000L)).toInstant();

  CsvToFhirConverter sut = new CsvToFhirConverter(repo, gitProperties);

  @BeforeAll
  public static void init() {
    gitProperties = mock(GitProperties.class);
    repo = spy(DeviceTypeRepository.class);

    when(gitProperties.getCommitTime()).thenReturn(commitTime);
    when(gitProperties.getShortCommitId()).thenReturn("short-commit-id");
  }

  @Test
  public void convertExistingCsv_success() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var output = sut.convertToFhirBundles(input, UUID.randomUUID());

    var first = output.stream().findFirst().get();
    var resourceUrls =
        first.getEntry().stream()
            .map(Bundle.BundleEntryComponent::getFullUrl)
            .collect(Collectors.toList());

    verify(repo, times(1)).findDeviceTypeByModelIgnoreCase(anyString());
    assertThat(output.size()).isEqualTo(1);
    assertThat(first.getEntry().size()).isEqualTo(13);
    assertThat(resourceUrls.size()).isEqualTo(13);
  }

  private InputStream loadCsv(String csvFile) {
    return CsvToFhirConverterTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
