package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
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

  private final SupportedDiseaseRepository _supportedDiseaseRepo;

  private SupportedDisease covid;
  private SupportedDisease fluA;
  private SupportedDisease fluB;

  private final Map<UUID, SupportedDisease> supportedDiseaseMap = new HashMap<>();

  public void initDiseases() {
    covid = _supportedDiseaseRepo.findByName(COVID19_NAME).orElse(null);
    fluA = _supportedDiseaseRepo.findByName(FLU_A_NAME).orElse(null);
    fluB = _supportedDiseaseRepo.findByName(FLU_B_NAME).orElse(null);

    Optional.ofNullable(covid).ifPresent(sd -> supportedDiseaseMap.put(sd.getInternalId(), sd));
    Optional.ofNullable(fluA).ifPresent(sd -> supportedDiseaseMap.put(sd.getInternalId(), sd));
    Optional.ofNullable(fluB).ifPresent(sd -> supportedDiseaseMap.put(sd.getInternalId(), sd));
  }

  public List<SupportedDisease> fetchSupportedDiseases() {
    return _supportedDiseaseRepo.findAll();
  }

  public Map<UUID, SupportedDisease> getKnownSupportedDiseasesMap() {
    return supportedDiseaseMap;
  }

  public SupportedDisease getDiseaseByName(String name) {
    return switch (name) {
      case COVID19_NAME -> covid;
      case FLU_A_NAME -> fluA;
      case FLU_B_NAME -> fluB;
      default -> _supportedDiseaseRepo
          .findByName(name)
          .orElseThrow(() -> new IllegalArgumentException("Disease not found"));
    };
  }

  public SupportedDisease covid() {
    return covid;
  }

  public SupportedDisease fluA() {
    return fluA;
  }

  public SupportedDisease fluB() {
    return fluB;
  }
}
