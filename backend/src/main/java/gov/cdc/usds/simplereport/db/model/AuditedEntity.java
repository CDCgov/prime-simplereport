package gov.cdc.usds.simplereport.db.model;

import java.util.Date;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.DynamicUpdate;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * A base entity class for things that have UUID primary key and auto-populated
 * creation/modification timestamps. 
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@DynamicUpdate
public abstract class AuditedEntity {

	@Column(updatable = false, nullable = false)
	@Id
	@GeneratedValue(generator = "UUID4")
	private UUID internalId;

	@Column(updatable = false)
	@CreatedDate
	private Date createdAt;

	@Column
	@LastModifiedDate
	private Date updatedAt;

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
