package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class TestResultMutationResolver {
  private final TestEventRepository testEventRepository;
  private final TestEventReportingService testEventReportingService;

  @MutationMapping
  public boolean resendToReportStream(@Argument List<UUID> testEventIds) {
    testEventRepository
        .findAllByInternalIdIn(testEventIds)
        .forEach(testEventReportingService::report);
    return true;
  }
}
