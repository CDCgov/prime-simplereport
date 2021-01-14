package gov.cdc.usds.simplereport.db.model;

import java.util.Date;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.NaturalId;
import org.hibernate.annotations.UpdateTimestamp;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

/**
 * The bare minimum required to link an authenticated identity to actions and data
 * elsewhere in the schema.
 * 
 * Since we can't use JPA auditing here, we use Hibernate {@link CreationTimestamp} and
 * {@link UpdateTimestamp}, and feel kind of weird about it.
 */
@Entity
@DynamicUpdate
public class ApiUser {

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
	@Column(nullable = false, updatable = true, unique = true)
	@NaturalId(mutable = true)
	private String loginEmail;
	@Embedded
	private PersonName nameInfo;
	private Date lastSeen;

	protected ApiUser() { /* for hibernate */ }

	public ApiUser(String email, PersonName name) {
		loginEmail = email;
		nameInfo = name;
		lastSeen = new Date();
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

	public void setLoginEmail(String newEmail) {
		loginEmail = newEmail;
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

	public void setNameInfo(PersonName newNameInfo) {
		nameInfo = newNameInfo;
	}
}
