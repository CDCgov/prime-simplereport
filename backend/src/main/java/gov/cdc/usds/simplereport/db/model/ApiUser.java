package gov.cdc.usds.simplereport.db.model;

import java.util.Date;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.NaturalId;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

/**
 * The bare minimum required to link an authenticated identity to actions and data
 * elsewhere in the schema.
 */
@Entity
@DynamicUpdate
public class ApiUser {

	@Column(updatable = false, nullable = false)
	@Id
	@GeneratedValue(generator = "UUID4")
	private UUID internalId;
	@Column(updatable = false)
	private Date createdAt;
	@Column
	private Date updatedAt;
	@Column(nullable = false, updatable = false)
	@NaturalId
	private String loginEmail;
	@Embedded
	private PersonName nameInfo;
	private Date lastSeen;

	protected ApiUser() { /* for hibernate */ }

	public ApiUser(String email, PersonName name) {
		loginEmail = email;
		nameInfo = name;
		Date now = new Date();
		lastSeen = now;
		createdAt = now;
		updatedAt = now;
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

	public String getLoginEmail() {
		return loginEmail;
	}

	public Date getLastSeen() {
		return lastSeen;
	}

	public void updateLastSeen() {
		lastSeen = new Date();
	}

	public PersonName getNameInfo() {
		return nameInfo;
	}
}
