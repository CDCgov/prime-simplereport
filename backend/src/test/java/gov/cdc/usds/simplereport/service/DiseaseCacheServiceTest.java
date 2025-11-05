package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.config.CachingConfig;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

class DiseaseCacheServiceTest extends BaseServiceTest<DiseaseCacheService> {

  @Autowired CachingConfig cacheConfig;

  @Autowired @MockitoSpyBean static SupportedDiseaseRepository repo;

  @BeforeEach
  public void setup() {
    // clear possible invocations to the repo from application setup steps
    // and concern ourselves only with within-test calls to the db
    reset(repo);
  }

  @Test
  void getDiseaseCacheWhenCachePopulated_successful() {
    Map<UUID, SupportedDisease> serviceMap = _service.getKnownSupportedDiseasesMap();
    List<SupportedDisease> repoList = repo.findAll();

    assertThat(serviceMap).isNotNull().isNotEmpty();

    repoList.forEach(
        d -> {
          assertThat(serviceMap).containsEntry(d.getInternalId(), d);
        });

    verify(repo, times(1)).findAll();
  }

  @Test
  void getDiseaseCacheWhenCacheNotPopulated_successful() {
    _service.evictAllCacheValues();
    Map<UUID, SupportedDisease> serviceMap = _service.getKnownSupportedDiseasesMap();
    List<SupportedDisease> repoList = repo.findAll();

    assertThat(serviceMap).isNotNull().isNotEmpty();

    repoList.forEach(
        d -> {
          assertThat(serviceMap).containsEntry(d.getInternalId(), d);
        });

    verify(repo, times(2)).findAll();
  }
}
