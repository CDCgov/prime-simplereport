package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.UpdateSpecimenType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedSpecimenTypeException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class SpecimenTypeService {
  private SpecimenTypeRepository _specimenTypeRepo;

  private static final String NUMERIC_REGEX = "^[0-9]*$";

  public SpecimenTypeService(SpecimenTypeRepository specimenTypeRepo) {
    _specimenTypeRepo = specimenTypeRepo;
  }

  public SpecimenType fetchByInternalId(UUID internalID) {
    return _specimenTypeRepo.findByInternalId(internalID);
  }

  public List<SpecimenType> fetchSpecimenTypes() {
    return _specimenTypeRepo.findAll();
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public SpecimenType createSpecimenType(CreateSpecimenType input) {
    return _specimenTypeRepo.save(
        new SpecimenType(
            input.getName(),
            input.getTypeCode(),
            input.getCollectionLocationName(),
            input.getCollectionLocationCode()));
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public SpecimenType updateSpecimenType(UpdateSpecimenType input) {
    boolean collectionCodeValid =
        input.getCollectionLocationCode() == null
            || input.getCollectionLocationCode().matches(NUMERIC_REGEX);
    if (!collectionCodeValid) {
      throw new IllegalGraphqlArgumentException(
          "If specified, collection location code needs to be a numeric string");
    }

    String typeCodeToMatch = input.getTypeCode();
    SpecimenType specimenToUpdate =
        _specimenTypeRepo
            .findByTypeCode(typeCodeToMatch)
            .orElseThrow(() -> new UnidentifiedSpecimenTypeException(typeCodeToMatch));

    specimenToUpdate.setName(input.getName());
    specimenToUpdate.setCollectionLocationCode(input.getCollectionLocationCode());
    specimenToUpdate.setCollectionLocationName(input.getCollectionLocationName());

    return _specimenTypeRepo.save(specimenToUpdate);
  }
}
