package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.TenantDataAccess;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;

public interface TenantDataAccessRepository
    extends EternalAuditedEntityRepository<TenantDataAccess> {

  @Query(BASE_QUERY + " and grantedToApiUser.internalId = :uuid and e.expiresAt > NOW()")
  List<TenantDataAccess> findValidByApiUserId(UUID uuid);
}
