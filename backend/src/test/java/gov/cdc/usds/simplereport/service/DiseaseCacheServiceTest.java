package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.config.CachingConfig;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;

class DiseaseCacheServiceTest extends BaseServiceTest<DiseaseCacheService> {

  @Autowired CachingConfig cacheConfig;

  @Autowired @SpyBean SupportedDiseaseRepository repo;

  @Test
  void getDiseaseCache_successful() {
    Map<UUID, SupportedDisease> serviceMap = _service.getKnownSupportedDiseasesMap();
    List<SupportedDisease> repoList = repo.findAll();

    assertThat(serviceMap).isNotNull().hasSize(4);

    repoList.forEach(
        d -> {
          assertThat(serviceMap).containsEntry(d.getInternalId(), d);
        });
  }
}
