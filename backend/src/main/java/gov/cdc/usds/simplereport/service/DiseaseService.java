package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.List;
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

  public void initDiseases() {
    covid = _supportedDiseaseRepo.findByName("COVID-19").orElse(null);
    fluA = _supportedDiseaseRepo.findByName("Flu A").orElse(null);
    fluB = _supportedDiseaseRepo.findByName("Flu B").orElse(null);
  }

  public List<SupportedDisease> fetchSupportedDiseases() {
    return (List<SupportedDisease>) _supportedDiseaseRepo.findAll();
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
