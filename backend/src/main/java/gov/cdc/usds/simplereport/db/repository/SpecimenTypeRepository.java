package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpecimenTypeRepository extends EternalAuditedEntityRepository<SpecimenType> {

  List<SpecimenType> findAll();

  SpecimenType findByInternalId(UUID internalID);

  List<SpecimenType> findAllByInternalIdIn(List<UUID> uuids);

  @Deprecated // this doesn't check for soft-deletion! But we need that behavior for the
  // backward-compatibility shim code.
  Optional<SpecimenType> findByTypeCode(String swabType);

  List<SpecimenType> findAllByIsDeletedFalse();
}
