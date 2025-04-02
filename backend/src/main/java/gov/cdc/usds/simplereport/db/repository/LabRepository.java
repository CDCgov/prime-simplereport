package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Lab;
import java.util.Optional;

/** Specification of EternalAuditedEntityRepository for {@link Lab} manipulation. */
public interface LabRepository extends EternalAuditedEntityRepository<Lab> {
  Optional<Lab> findByCode(String code);
}
