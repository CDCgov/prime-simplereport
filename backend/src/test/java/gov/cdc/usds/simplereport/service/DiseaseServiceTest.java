package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.config.CachingConfig.SUPPORTED_DISEASE_ID_MAP;
import static gov.cdc.usds.simplereport.service.DiseaseService.COVID19_NAME;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import gov.cdc.usds.simplereport.config.CachingConfig;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;


class DiseaseServiceTest extends BaseServiceTest<DiseaseService> {

    @Autowired
    CachingConfig cacheConfig;

    @Autowired
    SupportedDiseaseRepository repo;

    private Optional<SupportedDisease> getCachedDisease(UUID diseaseId) {
        return Optional.ofNullable(
                        cacheConfig.cacheManager()
                                .getCache(SUPPORTED_DISEASE_ID_MAP))
                .map(c -> c.get(diseaseId, SupportedDisease.class));
    }

    @Test
    void retrievesCachedDisease() {
        Optional<SupportedDisease> testCacheDisease = repo.findByName(COVID19_NAME);
        Optional<SupportedDisease> cachedDisease = getCachedDisease(testCacheDisease.get().getInternalId());
        assertNotEquals(Optional.empty(), cachedDisease);
        assertEquals(testCacheDisease, cachedDisease);
    }

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
                .hasSize(4)
                .containsEntry(_service.covid().getInternalId(), _service.covid())
                .containsEntry(_service.fluA().getInternalId(), _service.fluA())
                .containsEntry(_service.fluB().getInternalId(), _service.fluB())
                .containsEntry(_service.rsv().getInternalId(), _service.rsv());
    }
}
