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
	private String lookupId;
	@Column(nullable = false)
	private String firstName;
	@Column
	private String middleName;
	@Column(nullable = false)
	private String lastName;
	@Column
	private String suffix;
	@Column(nullable = false)
	private LocalDate birthDate;
	@Embedded
	private StreetAddress address;
	@Column
	private String gender;
	@Column
	private String race;
	@Column
	private String ethnicity;
	@Column
	private String telephone;
	@Column
	private String email;
	@Column(nullable = false)
	private boolean employedInHealthcare;
	@Column
	private String typeOfHealthcareProfessional;
	@Column(nullable = false)
	private boolean residentCongregateSetting;
	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id")
	private Organization organization;

	public Person(
		Organization organization,
		String lookupId,
		String firstName,
		String middleName,
		String lastName,
		LocalDate birthDate,
		StreetAddress address,
		String telephone,
		String typeOfHealthcareProfessional,
		String email,
		String race,
		String ethnicity,
		String gender,
		Boolean residentCongregateSetting,
		Boolean employedInHealthcare
	) {
		this.lookupId = lookupId;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.birthDate = birthDate;
		this.telephone = telephone;
		this.address = address;
		this.organization = organization;
		this.typeOfHealthcareProfessional = typeOfHealthcareProfessional;
		this.email = email;
		this.race = race;
		this.ethnicity = ethnicity;
		this.gender = gender;
		this.residentCongregateSetting = residentCongregateSetting;
		this.employedInHealthcare = employedInHealthcare;
	}

	public void updatePatient(
		String lookupId,
		String firstName,
		String middleName,
		String lastName,
		LocalDate birthDate,
		StreetAddress address,
		String telephone,
		String typeOfHealthcareProfessional,
		String email,
		String race,
		String ethnicity,
		String gender,
		Boolean residentCongregateSetting,
		Boolean employedInHealthcare
	) {
		this.lookupId = lookupId;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.birthDate = birthDate;
		this.telephone = telephone;
		this.address = address;
		this.typeOfHealthcareProfessional = typeOfHealthcareProfessional;
		this.email = email;
		this.race = race;
		this.ethnicity = ethnicity;
		this.gender = gender;
		this.residentCongregateSetting = residentCongregateSetting;
		this.employedInHealthcare = employedInHealthcare;
	}

	public String getLookupId() {
		return lookupId;
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
	public String getEmail() {
		return email;
	}
	public String getRace() {
		return race;
	}

	public String getEthnicity() {
		return ethnicity;
	}

	public String getGender() {
		return gender;
	}
	public Boolean getResidentCongregateSetting() {
		return residentCongregateSetting;
	}

	public Boolean getEmployedInHealthcare() {
		return employedInHealthcare;
	}
	public Organization getOrganization() {
		return organization;
	}
}