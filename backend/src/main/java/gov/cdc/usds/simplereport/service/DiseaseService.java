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
    if (name.contains("COVID")) {
      return covid;
    } else if (name.contains("Flu A")) {
      return fluA;
    } else if (name.contains("Flu B")) {
      return fluB;
    }
    return _supportedDiseaseRepo.findSupportedDiseaseByNameContains(name);
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
