package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.service.DataHubUploaderService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestResultMutationResolver implements GraphQLMutationResolver {
  private final DataHubUploaderService _dataHubUploaderService;

  public boolean resendToReportStream(List<UUID> testEventIds) {
    _dataHubUploaderService.dataHubUploaderTask(testEventIds);
    return true;
  }
}
