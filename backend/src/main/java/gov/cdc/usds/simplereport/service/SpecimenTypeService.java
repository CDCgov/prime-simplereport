package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SpecimenTypeService {
  private SpecimenTypeRepository _specimenTypeRepo;

  public SpecimenTypeService(SpecimenTypeRepository specimenTypeRepo) {
    _specimenTypeRepo = specimenTypeRepo;
  }

  public List<SpecimenType> fetchSpecimenTypes() {
    return _specimenTypeRepo.findAll();
  }
}
