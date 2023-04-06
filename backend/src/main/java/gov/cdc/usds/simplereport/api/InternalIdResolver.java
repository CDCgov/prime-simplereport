package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.DatabaseEntity;
import java.util.UUID;

/** Resolver mix-in to alias "id" to "internalId" */
public interface InternalIdResolver<T extends DatabaseEntity> {
  UUID getId(T entity);
}
