package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DiseaseService {
  public SupportedDiseaseRepository _repo;

  public DiseaseService(SupportedDiseaseRepository repo) {
    _repo = repo;
  }

  public List<SupportedDisease> fetchSupportedDiseases() {
    return (List<SupportedDisease>) _repo.findAll();
  }
}
