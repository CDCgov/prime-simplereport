package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Provider;
import java.util.Optional;
import java.util.UUID;

public interface ProviderRepository extends EternalAuditedEntityRepository<Provider> {
  Optional<Provider> findByInternalIdAndIsDeletedIsFalse(UUID id);
}
