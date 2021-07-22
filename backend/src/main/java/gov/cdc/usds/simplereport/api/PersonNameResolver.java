package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.PersonEntity;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import graphql.kickstart.tools.GraphQLResolver;

/** Resolver mix-in to handle aliasing "nameInfo" to "name" */
public interface PersonNameResolver<T extends PersonEntity> extends GraphQLResolver<T> {
  default PersonName getName(T entity) {
    return entity.getNameInfo();
  }
}
