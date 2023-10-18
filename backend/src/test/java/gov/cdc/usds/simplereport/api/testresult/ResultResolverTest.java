package gov.cdc.usds.simplereport.api.testresult;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.ResultService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Page;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ResultResolverTest {
  @Test
  void resultsPage_facilityId_null_returnsResultsForOrganization() {
    // GIVEN
    ResultService resultService = mock(ResultService.class);
    DiseaseService diseaseService = mock(DiseaseService.class);

    var sut = new ResultResolver(resultService, diseaseService);

    // WHEN
    when(resultService.getOrganizationResults(null, null, null, null, null, null, 0, 20))
        .thenReturn(Page.empty());
    sut.resultsPage(null, null, null, null, null, null, null, 0, 20);

    // THEN
    verify(resultService, times(1))
        .getOrganizationResults(null, null, null, null, null, null, 0, 20);
  }

  @Test
  void resultsPage_facilityId_notNull_returnsResultsForFacility() {
    // GIVEN
    ResultService resultService = mock(ResultService.class);
    DiseaseService diseaseService = mock(DiseaseService.class);

    var facilityId = UUID.randomUUID();
    var sut = new ResultResolver(resultService, diseaseService);

    // WHEN
    when(resultService.getFacilityResults(facilityId, null, null, null, null, null, null, 0, 20))
        .thenReturn(Page.empty());
    sut.resultsPage(facilityId, null, null, null, null, null, null, 0, 20);

    // THEN
    verify(resultService, times(1))
        .getFacilityResults(facilityId, null, null, null, null, null, null, 0, 20);
  }
}
