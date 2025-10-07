package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.OrganizationLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.TopLevelDashboardMetrics;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.util.Date;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class TestResultResolver {

  private final TestOrderService tos;
  private final TestResultUploadService testResultUploadService;

  @QueryMapping
  public Page<TestEvent> testResultsPage(
      @Argument UUID facilityId,
      @Argument UUID patientId,
      @Argument String result,
      @Argument String role,
      @Argument Date startDate,
      @Argument Date endDate,
      @Argument int pageNumber,
      @Argument int pageSize) {
    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    if (facilityId == null) {
      return tos.getOrganizationTestEventsResults(
          patientId,
          Translators.parseTestResult(result),
          Translators.parsePersonRole(role, true),
          startDate,
          endDate,
          pageNumber,
          pageSize);
    }
    return tos.getFacilityTestEventsResults(
        facilityId,
        patientId,
        Translators.parseTestResult(result),
        Translators.parsePersonRole(role, true),
        startDate,
        endDate,
        pageNumber,
        pageSize);
  }

  @QueryMapping
  public int testResultsCount(
      @Argument UUID facilityId,
      @Argument UUID patientId,
      @Argument String result,
      @Argument String role,
      @Argument Date startDate,
      @Argument Date endDate,
      @Argument UUID orgId) {
    return tos.getTestResultsCount(
        facilityId,
        patientId,
        Translators.parseTestResult(result),
        Translators.parsePersonRole(role, true),
        startDate,
        endDate,
        orgId);
  }

  @MutationMapping
  public TestEvent correctTestMarkAsError(@Argument UUID id, @Argument String reason) {
    return tos.markAsError(id, reason);
  }

  @MutationMapping
  public TestEvent correctTestMarkAsCorrection(@Argument UUID id, @Argument String reason) {
    return tos.markAsCorrection(id, reason);
  }

  @QueryMapping
  public TestEvent testResult(@Argument UUID id) {
    return tos.getTestResult(id);
  }

  @QueryMapping
  public OrganizationLevelDashboardMetrics organizationLevelDashboardMetrics(
      @Argument Date startDate, @Argument Date endDate) {
    return tos.getOrganizationLevelDashboardMetrics(startDate, endDate);
  }

  @QueryMapping
  public TopLevelDashboardMetrics topLevelDashboardMetrics(
      @Argument UUID facilityId, @Argument Date startDate, @Argument Date endDate) {
    return tos.getTopLevelDashboardMetrics(facilityId, startDate, endDate);
  }

  @QueryMapping
  public UploadResponse uploadSubmission(@Argument UUID id)
      throws InvalidBulkTestResultUploadException, InvalidRSAPrivateKeyException {
    return testResultUploadService.getUploadSubmission(id);
  }

  @QueryMapping
  public Page<TestResultUpload> uploadSubmissions(
      @Argument Date startDate,
      @Argument Date endDate,
      @Argument int pageNumber,
      @Argument int pageSize) {
    return testResultUploadService.getUploadSubmissions(startDate, endDate, pageNumber, pageSize);
  }
}
