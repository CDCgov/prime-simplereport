package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import javax.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
@Slf4j
public class DiseaseService {

  @Autowired SupportedDiseaseRepository _supportedDiseaseRepo;

  private SupportedDisease COVID;
  private SupportedDisease FLU_A;
  private SupportedDisease FLU_B;

  public void initDiseases() {
    COVID = _supportedDiseaseRepo.findSupportedDiseaseByNameContains("COVID");
    FLU_A = _supportedDiseaseRepo.findSupportedDiseaseByNameContains("Flu A");
    FLU_B = _supportedDiseaseRepo.findSupportedDiseaseByNameContains("Flu B");
  }

  public SupportedDisease covid() {
    return COVID;
  }

  public SupportedDisease fluA() {
    return FLU_A;
  }

  public SupportedDisease fluB() {
    return FLU_B;
  }
}
