package gov.cdc.usds.simplereport.db.model;

import java.util.Date;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Base class for entities that have no user creating or modifying them, but
 * still have creation and modification times and a UUID primary key.
 */
@MappedSuperclass
public abstract class SystemManagedEntity {

    @Column(updatable = false, nullable = false)
    @Id
    @GeneratedValue(generator = "UUID4")
    private UUID internalId;

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

    public UUID getInternalId() {
        return internalId;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

}
