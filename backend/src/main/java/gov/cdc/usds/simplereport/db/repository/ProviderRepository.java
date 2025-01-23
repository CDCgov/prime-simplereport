package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

import java.util.Optional;
import java.util.UUID;

public interface ProviderRepository extends EternalAuditedEntityRepository<Provider> {
  Optional<Provider> findByInternalIdAndIsDeletedIsFalse(UUID id);

  boolean existsByNameInfoAndProviderId(PersonName nameInfo, String providerId);
}
