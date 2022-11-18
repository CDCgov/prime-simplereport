package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Transactional
@Slf4j
public class DiseaseService {

  SupportedDiseaseRepository _supportedDiseaseRepo;

  DiseaseService(SupportedDiseaseRepository repo) {
    this._supportedDiseaseRepo = repo;
  }

  private SupportedDisease covid;
  private SupportedDisease fluA;
  private SupportedDisease fluB;

  private final Map<UUID, SupportedDisease> supportedDiseaseMap = new HashMap<>();

  public void initDiseases() {
    covid = _supportedDiseaseRepo.findByName("COVID-19").orElse(null);
    fluA = _supportedDiseaseRepo.findByName("Flu A").orElse(null);
    fluB = _supportedDiseaseRepo.findByName("Flu B").orElse(null);

    if (covid != null) {
      supportedDiseaseMap.put(covid.getInternalId(), covid);
    }
    if (fluA != null) {
      supportedDiseaseMap.put(fluA.getInternalId(), fluA);
    }
    if (fluB != null) {
      supportedDiseaseMap.put(fluB.getInternalId(), fluB);
    }
  }

  public List<SupportedDisease> fetchSupportedDiseases() {
    return _supportedDiseaseRepo.findAll();
  }

  public Map<UUID, SupportedDisease> getCachedSupportedDiseasesMap() {
    return supportedDiseaseMap;
  }

  public SupportedDisease getDiseaseByName(String name) {
    switch (name) {
      case "COVID-19":
        return covid;
      case "Flu A":
        return fluA;
      case "Flu B":
        return fluB;
      default:
        return _supportedDiseaseRepo
            .findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("Disease not found"));
    }
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
