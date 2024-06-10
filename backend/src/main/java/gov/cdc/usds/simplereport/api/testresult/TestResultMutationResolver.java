package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class TestResultMutationResolver {
  private final TestEventRepository testEventRepository;

  @Qualifier("csvQueueReportingService")
  private final TestEventReportingService testEventReportingService;

  @Qualifier("fhirQueueReportingService")
  private final TestEventReportingService fhirReportingService;

  @MutationMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public boolean resendToReportStream(
      @Argument List<UUID> testEventIds, @Argument boolean fhirOnly, @Argument boolean covidOnly) {
    testEventRepository
        .findAllByInternalIdIn(testEventIds)
        .forEach(
            testEvent -> {
              if (!fhirOnly) {
                testEventReportingService.report(testEvent);
              }
              if (!covidOnly) {
                fhirReportingService.report(testEvent);
              }
            });

    return true;
  }
}
