package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestResultMutationResolver implements GraphQLMutationResolver {
  private final TestEventRepository testEventRepository;
  private final TestEventReportingService testEventReportingService;

  public boolean resendToReportStream(List<UUID> testEventIds) {
    testEventRepository
        .findAllByInternalIdIn(testEventIds)
        .forEach(testEventReportingService::report);
    return true;
  }
}
