package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.PersonEntity;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

/** Resolver mix-in to handle aliasing "nameInfo" to "name" */
public interface PersonNameResolver<T extends PersonEntity> {
  PersonName getName(T entity);
}
