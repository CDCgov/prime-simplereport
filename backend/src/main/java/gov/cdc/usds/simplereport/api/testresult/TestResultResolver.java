package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
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
  public static final String MISSING_ARG = "Must provide either facility ID or patient ID";

  @Autowired private TestOrderService tos;

  public List<TestEvent> getTestResults(
      UUID facilityId, UUID patientId, int pageNumber, int pageSize) {
    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    if (patientId != null) {
      return tos.getTestEventsResultsByPatient(patientId, pageNumber, pageSize);
    } else if (facilityId != null) {
      return tos.getTestEventsResults(facilityId, pageNumber, pageSize);
    } else {
      throw new IllegalGraphqlArgumentException(MISSING_ARG);
    }
  }

  public int testResultsCount(UUID facilityId, UUID patientId) {
    if (patientId != null) {
      return tos.getTestResultsCountByPatient(patientId);
    } else if (facilityId != null) {
      return tos.getTestResultsCount(facilityId);
    } else {
      throw new IllegalGraphqlArgumentException(MISSING_ARG);
    }
  }

  public TestEvent correctTestMarkAsError(UUID id, String reasonForCorrection) {
    return tos.correctTestMarkAsError(id, reasonForCorrection);
  }

  public TestEvent getTestResult(UUID id) {
    return tos.getTestResult(id);
  }
}
