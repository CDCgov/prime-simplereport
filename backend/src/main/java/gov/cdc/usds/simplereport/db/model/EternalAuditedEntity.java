package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

/**
 * Intermediate base class for entities that should be tagged as "deleted" in the database rather
 * than actually being deleted.
 */
@MappedSuperclass
public abstract class EternalAuditedEntity extends AuditedEntity implements Eternal {

  @Column private boolean isDeleted;

  /** Is this entity soft-deleted? HINT: you should almost never need to ask. */
  @JsonIgnore // this is an artifact of serializing the data at test time, but also seems...
  // correct?
  @Override
  public boolean isDeleted() {
    return isDeleted;
  }

  // This getter was created in response to a startup failure where
  // Spring graphql was failing to map the schema without this getter.
  // The app will fail to start without this getter.
  public boolean getIsDeleted() {
    return isDeleted;
  }

  @Override
  public void setIsDeleted(boolean deleted) {
    this.isDeleted = deleted;
  }
}
