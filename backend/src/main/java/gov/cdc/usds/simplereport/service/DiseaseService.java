package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.transaction.Transactional;
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

  private final DiseaseCacheService diseaseCacheService;

  public void initDiseases() {
    diseaseCacheService.getKnownSupportedDiseasesMap();
  }

  public List<SupportedDisease> fetchSupportedDiseases() {
    return getDiseaseNameToSupportedDiseaseMap().values().stream().toList();
  }

  public Map<String, SupportedDisease> getDiseaseNameToSupportedDiseaseMap() {
    return getKnownSupportedDiseasesMap().values().stream()
        .collect(Collectors.toMap(SupportedDisease::getName, Function.identity()));
  }

  public Map<UUID, SupportedDisease> getKnownSupportedDiseasesMap() {
    return diseaseCacheService.getKnownSupportedDiseasesMap();
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
}
