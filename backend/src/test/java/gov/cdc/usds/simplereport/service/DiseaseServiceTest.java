package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DiseaseServiceTest extends BaseServiceTest<DiseaseService> {

  @Test
  void retrievesCovid_successful() {
    assertNotNull(_service.covid());
    assertEquals("COVID-19", _service.covid().getName());
  }

  @Test
  void retrievesFluA_successful() {
    assertNotNull(_service.fluA());
    assertEquals("Flu A", _service.fluA().getName());
  }

  @Test
  void retrievesFluB_successful() {
    assertNotNull(_service.fluB());
    assertEquals("Flu B", _service.fluB().getName());
  }

  @Test
  void retrievesSupportedDiseasesMap_successful() {
    Map<UUID, SupportedDisease> supportedDiseasesMap = _service.getKnownSupportedDiseasesMap();

    assertThat(supportedDiseasesMap)
        .isNotNull()
        .hasSize(3)
        .containsEntry(_service.covid().getInternalId(), _service.covid())
        .containsEntry(_service.fluA().getInternalId(), _service.fluA())
        .containsEntry(_service.fluB().getInternalId(), _service.fluB());
  }
}
