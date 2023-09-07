package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.service.DiseaseService.COVID19_NAME;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.config.CachingConfig;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;

class DiseaseServiceTest extends BaseServiceTest<DiseaseService> {

  @Autowired CachingConfig cacheConfig;

  @Autowired @SpyBean SupportedDiseaseRepository repo;

  @Test
  void getCachedDisease_doesntHitRepo() {
    SupportedDisease testCacheDisease = repo.findByName(COVID19_NAME).orElse(null);

    // result should only hit the cached ID <> Disease hashmap
    SupportedDisease cachedDisease = _service.getDiseaseByName(COVID19_NAME);
    assertEquals(testCacheDisease, cachedDisease);

    // should get called once on initDiseases but not after in subsequent getCachedDiseases
    verify(repo, times(1)).findAll();
  }

  @Test
  void getCovid_successful() {
    assertNotNull(_service.covid());
    assertEquals("COVID-19", _service.covid().getName());
  }

  @Test
  void getFluA_successful() {
    assertNotNull(_service.fluA());
    assertEquals("Flu A", _service.fluA().getName());
  }

  @Test
  void getFluB_successful() {
    assertNotNull(_service.fluB());
    assertEquals("Flu B", _service.fluB().getName());
  }

  @Test
  void getByName_successful() {
    SupportedDisease covidByName = _service.getDiseaseByName(COVID19_NAME);
    SupportedDisease covidFromRepo = repo.findByName(COVID19_NAME).orElse(null);

    assertNotNull(covidByName);
    assertEquals(covidByName, covidFromRepo);
  }

  @Test
  void getSupportedDiseasesMap_successful() {
    Map<UUID, SupportedDisease> supportedDiseasesMap = _service.getKnownSupportedDiseasesMap();

    assertThat(supportedDiseasesMap)
        .isNotNull()
        .hasSize(4)
        .containsEntry(_service.covid().getInternalId(), _service.covid())
        .containsEntry(_service.fluA().getInternalId(), _service.fluA())
        .containsEntry(_service.fluB().getInternalId(), _service.fluB())
        .containsEntry(_service.rsv().getInternalId(), _service.rsv());
  }

  @Test
  void getSupportedDiseasesList_successful() {
    List<SupportedDisease> supportedDiseasesList = _service.getSupportedDiseaseList();

    assertThat(supportedDiseasesList)
        .isNotNull()
        .hasSize(4)
        .contains(_service.covid())
        .contains(_service.fluA())
        .contains(_service.fluB())
        .contains(_service.rsv());
  }
}
