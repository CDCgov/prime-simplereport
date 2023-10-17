package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.service.ResultService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
public class ResultResolverTest {
  @Mock ResultService resultService;

  //    @InjectMocks
  //    OrganizationResolver organizationMutationResolver;

  @Test
  void resultsPage_usesDefaultPaginationNumber() {
    // GIVEN

    // WHEN

    // THEN
  }

  @Test
  void resultsPage_usesDefaultPaginationSize() {
    // GIVEN

    // WHEN

    // THEN
  }

  @Test
  void resultsPage_facilityId_null_returnsResultsForOrganization() {
    // GIVEN

    // WHEN

    // THEN
  }

  @Test
  void resultsPage_facilityId_notNull_returnsResultsForFacility() {
    // GIVEN

    // WHEN

    // THEN
  }
}
