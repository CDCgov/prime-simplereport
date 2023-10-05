package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultsListItem;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.ResultService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.util.Date;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ResultResolver {

  private final ResultService service;
  private final DiseaseService diseaseService;

  @QueryMapping
  public Page<TestResultsListItem> resultsPage(
      @Argument UUID facilityId,
      @Argument UUID patientId,
      @Argument String result,
      @Argument String role,
      @Argument String disease,
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

    SupportedDisease supportedDisease =
        disease != null ? diseaseService.getDiseaseByName(disease) : null;

    if (facilityId == null) {
      return service
          .getOrganizationResults(
              patientId,
              Translators.parseTestResult(result),
              Translators.parsePersonRole(role, true),
              supportedDisease,
              startDate,
              endDate,
              pageNumber,
              pageSize)
          .map(TestResultsListItem::new);
    }

    return service
        .getFacilityResults(
            facilityId,
            patientId,
            Translators.parseTestResult(result),
            Translators.parsePersonRole(role, true),
            supportedDisease,
            startDate,
            endDate,
            pageNumber,
            pageSize)
        .map(TestResultsListItem::new);
  }
}
