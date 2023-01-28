package gov.cdc.usds.simplereport.api.supporteddisease;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.service.DiseaseService;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SupportedDiseaseDataLoaderServiceTest {

  @Test
  void getSupportedDisease_DataLoader() {
    var diseaseId1 = UUID.randomUUID();
    var diseaseId2 = UUID.randomUUID();
    var diseaseId3 = UUID.randomUUID();
    var supportedDisease1 = new SupportedDisease("flu a", "LP1234");
    var supportedDisease2 = new SupportedDisease("flu b", "LB5678");
    var supportedDisease3 = new SupportedDisease("covid", "95042-2");
    var mockSupportedDiseaseService = mock(DiseaseService.class);
    when(mockSupportedDiseaseService.getKnownSupportedDiseasesMap())
        .thenReturn(
            Map.of(
                diseaseId1,
                supportedDisease1,
                diseaseId2,
                supportedDisease2,
                diseaseId3,
                supportedDisease3));
    var dataLoaderService = new SupportedDiseaseDataLoaderService(mockSupportedDiseaseService);

    var actual = dataLoaderService.getSupportedDisease(Set.of(diseaseId1, diseaseId2));

    assertThat(actual).hasSize(2);
    assertThat(actual).containsKeys(diseaseId1, diseaseId2);
    assertThat(actual).containsValues(supportedDisease1, supportedDisease2);
  }
}
