package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.config.CachingConfig.SUPPORTED_DISEASE_ID_MAP;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;

import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class DiseaseCacheService {

    private final SupportedDiseaseRepository _supportedDiseaseRepo;

    @Cacheable(SUPPORTED_DISEASE_ID_MAP)
    public Map<UUID, SupportedDisease> getKnownSupportedDiseasesMap() {
        log.info("generating " + SUPPORTED_DISEASE_ID_MAP + " cache");
        return _supportedDiseaseRepo.findAll().stream()
                .collect(Collectors.toMap(SupportedDisease::getInternalId, Function.identity()));
    }
}
