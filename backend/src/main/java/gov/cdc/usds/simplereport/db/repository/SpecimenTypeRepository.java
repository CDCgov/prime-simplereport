package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;

import gov.cdc.usds.simplereport.db.model.SpecimenType;

public interface SpecimenTypeRepository extends EternalEntityRepository<SpecimenType> {

    Optional<SpecimenType> findByTypeCode(String swabType);

}
