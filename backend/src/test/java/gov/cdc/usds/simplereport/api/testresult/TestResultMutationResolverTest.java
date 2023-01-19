package gov.cdc.usds.simplereport.api.testresult;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createCovidTestEvent;
import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createMultiplexTestEvent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class TestResultMutationResolverTest {

  @Test
  void resendToReportStream_success() {
    var mockCsvReporter = mock(TestEventReportingService.class);
    var mockFhirReporter = mock(TestEventReportingService.class);
    var mockTestEventRepository = mock(TestEventRepository.class);

    when(mockTestEventRepository.findAllByInternalIdIn(any()))
        .thenReturn(List.of(createCovidTestEvent(), createMultiplexTestEvent()));
    var testResultMutationResolver =
        new TestResultMutationResolver(mockTestEventRepository, mockCsvReporter, mockFhirReporter);

    var actual =
        testResultMutationResolver.resendToReportStream(
            List.of(UUID.randomUUID(), UUID.randomUUID()));

    verify(mockCsvReporter, times(2)).report(any());
    verify(mockFhirReporter, times(1)).report(any());
    assertThat(actual).isTrue();
  }
}
