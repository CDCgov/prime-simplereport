package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.DatabaseEntity;
import java.util.UUID;
import graphql.kickstart.tools.GraphQLResolver;

/** Resolver mix-in to alias "id" to "internalId" */
public interface InternalIdResolver<T extends DatabaseEntity> extends GraphQLResolver<T> {

  default UUID getId(T entity) {
    return entity.getInternalId();
  }
}
