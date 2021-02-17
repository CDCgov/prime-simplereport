package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Intermediate base class for entities that should be tagged as "deleted" in
 * the database rather than actually being deleted.
 */
@MappedSuperclass
public abstract class EternalEntity extends AuditedEntity {

    @Column
    private boolean isDeleted;

    /**
     * Is this entity soft-deleted? HINT: you should almost never need to ask.
     */
    @JsonIgnore // this is an artifact of serializing the data at test time, but also seems... correct?
    public boolean isDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean deleted) {
        this.isDeleted = deleted;
    }

}
