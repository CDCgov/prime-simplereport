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
    covid = _supportedDiseaseRepo.findSupportedDiseaseByNameContains("COVID");
    fluA = _supportedDiseaseRepo.findSupportedDiseaseByNameContains("Flu A");
    fluB = _supportedDiseaseRepo.findSupportedDiseaseByNameContains("Flu B");
  }

  public List<SupportedDisease> fetchSupportedDiseases() {
    return (List<SupportedDisease>) _supportedDiseaseRepo.findAll();
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
