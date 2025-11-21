package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.service.DiseaseService.COVID19_NAME;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.reset;
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
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

class DiseaseServiceTest extends BaseServiceTest<DiseaseService> {

  @Autowired CachingConfig cacheConfig;

  @Autowired @MockitoSpyBean SupportedDiseaseRepository repo;

  @Test
  void getCachedDisease_doesntHitRepo() {
    // clear possible invocations to the repo from application setup steps
    // and concern ourselves only with within-test calls to the db
    reset(repo);

    SupportedDisease testCacheDisease = repo.findByName(COVID19_NAME).orElse(null);

    // result should only hit the cached ID <> Disease hashmap
    SupportedDisease cachedDisease = _service.getDiseaseByName(COVID19_NAME);
    assertEquals(testCacheDisease, cachedDisease);

    // disease should be cached and therefore repo shouldn't be called
    verify(repo, times(0)).findAll();
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
  void getHepatitisC_successful() {
    SupportedDisease hepC = _service.hepatitisC();
    assertNotNull(hepC);
    assertEquals(DiseaseService.HEPATITIS_C_NAME, hepC.getName());
  }

  @Test
  void getGonorrhea_successful() {
    SupportedDisease gonorrhea = _service.gonorrhea();
    assertNotNull(gonorrhea);
    assertEquals(DiseaseService.GONORRHEA_NAME, gonorrhea.getName());
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
        .isNotEmpty()
        .containsEntry(_service.covid().getInternalId(), _service.covid())
        .containsEntry(_service.fluA().getInternalId(), _service.fluA())
        .containsEntry(_service.fluB().getInternalId(), _service.fluB())
        .containsEntry(_service.rsv().getInternalId(), _service.rsv())
        .containsEntry(_service.hiv().getInternalId(), _service.hiv())
        .containsEntry(_service.hepatitisC().getInternalId(), _service.hepatitisC())
        .containsEntry(_service.gonorrhea().getInternalId(), _service.gonorrhea());
  }

  @Test
  void getSupportedDiseasesList_successful() {
    List<SupportedDisease> supportedDiseasesList = _service.getSupportedDiseaseList();

    assertThat(supportedDiseasesList)
        .isNotNull()
        .isNotEmpty()
        .contains(_service.covid())
        .contains(_service.fluA())
        .contains(_service.fluB())
        .contains(_service.rsv())
        .contains(_service.hiv())
        .contains(_service.gonorrhea())
        .contains(_service.hepatitisC());
  }
}
