package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
  public static final String HIV_NAME = "HIV";

  private final DiseaseCacheService diseaseCacheService;

  public Map<UUID, SupportedDisease> getKnownSupportedDiseasesMap() {
    return diseaseCacheService.getKnownSupportedDiseasesMap();
  }

  public void initDiseases() {
    getKnownSupportedDiseasesMap();
  }

  public List<SupportedDisease> getSupportedDiseaseList() {
    return getDiseaseNameToSupportedDiseaseMap().values().stream().toList();
  }

  public Map<String, SupportedDisease> getDiseaseNameToSupportedDiseaseMap() {
    return getKnownSupportedDiseasesMap().values().stream()
        .collect(Collectors.toMap(SupportedDisease::getName, Function.identity()));
  }

  public SupportedDisease getDiseaseByName(String name) {
    return getDiseaseNameToSupportedDiseaseMap().get(name);
  }

  public SupportedDisease covid() {
    return getDiseaseByName(COVID19_NAME);
  }

  public SupportedDisease fluA() {
    return getDiseaseByName(FLU_A_NAME);
  }

  public SupportedDisease fluB() {
    return getDiseaseByName(FLU_B_NAME);
  }

  public SupportedDisease rsv() {
    return getDiseaseByName(RSV_NAME);
  }

  public SupportedDisease hiv() {
    return getDiseaseByName(HIV_NAME);
  }
}
