package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Base class for entities that have no user creating or modifying them, but still have creation and
 * modification times and a UUID primary key.
 *
 * <p>Since we can't use JPA auditing here, we use Hibernate {@link CreationTimestamp} and {@link
 * UpdateTimestamp}, and feel kind of weird about it.
 */
@MappedSuperclass
public abstract class SystemManagedEntity extends IdentifiedEntity {
  @Column(updatable = false)
  @Temporal(TemporalType.TIMESTAMP)
  @CreationTimestamp
  private Date createdAt;

  @Column
  @Temporal(TemporalType.TIMESTAMP)
  @UpdateTimestamp
  private Date updatedAt;

  protected SystemManagedEntity() {
    super();
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public Date getUpdatedAt() {
    return updatedAt;
  }
}
