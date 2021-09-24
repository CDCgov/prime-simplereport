package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SpecimenTypeService {
  private SpecimenTypeRepository _specimenTypeRepo;

  public SpecimenTypeService(SpecimenTypeRepository specimenTypeRepo) {
    _specimenTypeRepo = specimenTypeRepo;
  }

  public SpecimenType fetchByInternalId(UUID internalID) {
    return _specimenTypeRepo.findByInternalId(internalID);
  }

  public List<SpecimenType> fetchSpecimenTypes() {
    return _specimenTypeRepo.findAll();
  }
}
