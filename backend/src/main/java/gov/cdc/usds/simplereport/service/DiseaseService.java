package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.transaction.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import static gov.cdc.usds.simplereport.config.CachingConfig.*;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DiseaseService {
    public static final String COVID19_NAME = "COVID-19";
    public static final String FLU_A_NAME = "Flu A";
    public static final String FLU_B_NAME = "Flu B";
    public static final String FLU_A_AND_B_NAME = "Flu A and B";
    public static final String FLU_RNA_NAME = "Flu RNA";
    public static final String RSV_NAME = "RSV";

    private final SupportedDiseaseRepository _supportedDiseaseRepo;
    
    public void initDiseases() {
        getKnownSupportedDiseasesMap();
    }

    public List<SupportedDisease> fetchSupportedDiseases() {
        return getDiseaseNameToSupportedDiseaseMap().values().stream().toList();
    }

    @Cacheable(SUPPORTED_DISEASE_ID_MAP)
    public Map<UUID, SupportedDisease> getKnownSupportedDiseasesMap() {
        return _supportedDiseaseRepo.findAll().stream()
                .collect(Collectors.toMap(SupportedDisease::getInternalId, Function.identity()));
    }

    public Map<String, SupportedDisease> getDiseaseNameToSupportedDiseaseMap() {
        return getKnownSupportedDiseasesMap().values().stream()
                .collect(Collectors.toMap(SupportedDisease::getName, Function.identity()));
    }

    public SupportedDisease getDiseaseByName(String name) {
        return getDiseaseNameToSupportedDiseaseMap().get(name);
    }

}
