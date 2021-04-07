package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.db.model.DatabaseEntity;
import java.util.UUID;

public class WrappedEntity<T extends DatabaseEntity> implements Wrapper<T> {

  protected T wrapped;

  protected WrappedEntity(T model) {
    wrapped = model;
  }

  public T getWrapped() {
    return wrapped;
  }

  public UUID getInternalId() {
    return wrapped.getInternalId();
  }

  public UUID getId() {
    return getInternalId();
  }
}
