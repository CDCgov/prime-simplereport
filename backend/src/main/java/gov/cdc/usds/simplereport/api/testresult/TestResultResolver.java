package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.ApiTestResult;
import gov.cdc.usds.simplereport.api.model.OrganizationLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.TopLevelDashboardMetrics;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TestResultResolver implements GraphQLQueryResolver, GraphQLMutationResolver {
  public static final String MISSING_ARG = "Must provide either facility ID or patient ID";

  @Autowired private TestOrderService tos;

  public List<ApiTestResult> getTestResults(
      UUID facilityId,
      UUID patientId,
      String result,
      String role,
      Date startDate,
      Date endDate,
      int pageNumber,
      int pageSize) {
    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    List<TestEvent> testEvents =
        tos.getTestEventsResults(
            facilityId,
            patientId,
            Translators.parseTestResult(result),
            Translators.parsePersonRole(role, true),
            startDate,
            endDate,
            pageNumber,
            pageSize);
    return testEvents.stream().map(ApiTestResult::new).collect(Collectors.toList());
  }

  public int testResultsCount(
      UUID facilityId, UUID patientId, String result, String role, Date startDate, Date endDate) {
    return tos.getTestResultsCount(
        facilityId,
        patientId,
        Translators.parseTestResult(result),
        Translators.parsePersonRole(role, true),
        startDate,
        endDate);
  }

  public ApiTestResult correctTestMarkAsError(UUID id, String reasonForCorrection) {
    return new ApiTestResult(tos.correctTestMarkAsError(id, reasonForCorrection));
  }

  public ApiTestResult getTestResult(UUID id) {
    TestEvent event = tos.getTestResult(id);
    return new ApiTestResult(event);
  }

  public OrganizationLevelDashboardMetrics getOrganizationLevelDashboardMetrics(
      Date startDate, Date endDate) {
    return tos.getOrganizationLevelDashboardMetrics(startDate, endDate);
  }

  public TopLevelDashboardMetrics getTopLevelDashboardMetrics(
      UUID facilityId, Date startDate, Date endDate) {
    return tos.getTopLevelDashboardMetrics(facilityId, startDate, endDate);
  }
}
