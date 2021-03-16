package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TestResultResolver implements GraphQLQueryResolver, GraphQLMutationResolver {

  @Autowired private TestOrderService tos;

  public List<TestEvent> getTestResults(UUID facilityId, int pageNumber, int pageSize) {
    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    return tos.getTestEventsResults(facilityId, pageNumber, pageSize);
  }

  public TestEvent correctTestMarkAsError(UUID testEventId, String reasonForCorrection) {
    return tos.correctTestMarkAsError(testEventId, reasonForCorrection);
  }

  public TestEvent getTestResult(UUID id) {
    return tos.getTestResult(id);
  }
}
