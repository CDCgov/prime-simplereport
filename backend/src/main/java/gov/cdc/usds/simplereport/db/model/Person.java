package gov.cdc.usds.simplereport.db.model;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Person extends EternalEntity {

	@Column
	private String firstName;
	@Column
	private String middleName;
	@Column(nullable = false)
	private String lastName;
	@Column(nullable = false)
	private LocalDate birthDate;
	@Embedded
	private StreetAddress address;
	@Column
	private String telephone;
	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id")
	private Organization organization;

	public Person(Organization org, String firstName, String middleName, String lastName, LocalDate birthDate, StreetAddress address,
			String telephone) {
		super();
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.birthDate = birthDate;
		this.address = address;
		this.telephone = telephone;
		this.organization = org;
	}
	public String getFirstName() {
		return firstName;
	}
	public String getMiddleName() {
		return middleName;
	}
	public String getLastName() {
		return lastName;
	}
	public LocalDate getBirthDate() {
		return birthDate;
	}
	public StreetAddress getAddress() {
		return address;
	}
	public String getTelephone() {
		return telephone;
	}
	public Organization getOrganization() {
		return organization;
	}
}
