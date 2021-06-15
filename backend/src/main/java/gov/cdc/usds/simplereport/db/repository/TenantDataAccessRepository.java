package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.TenantDataAccess;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface TenantDataAccessRepository
    extends EternalAuditedEntityRepository<TenantDataAccess> {

  @Modifying
  @Query(
      "update #{#entityName} e set e.isDeleted = true where api_user_internal_id = :uuid and e.isDeleted = false")
  public void deleteAllByApiUserId(UUID uuid);

  @Query(BASE_QUERY + " and api_user_internal_id = :uuid and e.expiresAt > NOW()")
  public Optional<TenantDataAccess> findValidByApiUserId(UUID uuid);
}
