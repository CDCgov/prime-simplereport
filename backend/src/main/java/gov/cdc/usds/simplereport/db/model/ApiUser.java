package gov.cdc.usds.simplereport.db.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.NaturalId;

/**
 * The bare minimum required to link an authenticated identity to actions and data
 * elsewhere in the schema.
 */
@Entity
@DynamicUpdate
public class ApiUser extends AuditedEntity {

	@Column(nullable = false, updatable = false)
	@NaturalId
	private String loginEmail;
	@OneToOne(optional = false)
	@JoinColumn(name="person_id")
	private Person person;
	private Date lastSeen;

	protected ApiUser() { /* for hibernate */ }

	public ApiUser(String email, Person attachePerson) {
		loginEmail = email;
		person = attachePerson;
		lastSeen = new Date();
	}

	public String getLoginEmail() {
		return loginEmail;
	}

	public void setLoginEmail(String loginEmail) {
		this.loginEmail = loginEmail;
	}

	public Person getPerson() {
		return person;
	}

	public void setPerson(Person person) {
		this.person = person;
	}

	public Date getLastSeen() {
		return lastSeen;
	}

	public void updateLastSeen() {
		lastSeen = new Date();
	}
}
