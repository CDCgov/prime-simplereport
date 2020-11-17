package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import java.io.Serializable;

/**
 * Intermediate base class for entities that should be tagged as "deleted" in
 * the database rather than actually being deleted.
 */
@MappedSuperclass
public class EternalEntity extends AuditedEntity {

	@Column
	private boolean isDeleted;

	/**
	 * Is this entity soft-deleted? HINT: you should almost never need to ask.
	 */
	public boolean isDeleted() {
		return isDeleted;
	}

}
