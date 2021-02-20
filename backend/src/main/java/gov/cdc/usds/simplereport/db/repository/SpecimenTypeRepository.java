package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;

import gov.cdc.usds.simplereport.db.model.SpecimenType;

public interface SpecimenTypeRepository extends EternalEntityRepository<SpecimenType> {

    @Deprecated // this doesn't check for soft-deletion! But we need that behavior for the
                // backward-compatibility shim code.
    Optional<SpecimenType> findByTypeCode(String swabType);

}
