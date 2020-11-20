package gov.cdc.usds.simplereport.db.model;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;


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
	@Column
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
	@JsonProperty(value = "role")
	private String typeOfHealthcareProfessional;
	@Column(nullable = false)
	private boolean residentCongregateSetting;
	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id")
	@JsonIgnore // don't descend this model graph when serializing for TestEvent
	private Organization organization;
	@OneToMany()
	@JoinColumn(name = "patient_id")
	@JsonIgnore // dear Lord do not attempt to serialize this
	private List<TestOrder> testOrders;

	protected Person() { /* for hibernate */ }

	public Person(String firstName, String middleName, String lastName, String suffix, Organization org) {
		this.organization = org;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.suffix = suffix;
	}

	public String getTypeOfHealthcareProfessional() {
		return typeOfHealthcareProfessional;
	}

	public List<TestOrder> getTestOrders() {
		return testOrders;
	}

	public Person(
		Organization organization,
		String lookupId,
		String firstName,
		String middleName,
		String lastName,
		String suffix,
		LocalDate birthDate,
		StreetAddress address,
		String telephone,
		String role,
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
		this.typeOfHealthcareProfessional = role;
		this.email = email;
		this.race = race;
		this.ethnicity = ethnicity;
		this.gender = gender;
		this.residentCongregateSetting = residentCongregateSetting;
		this.employedInHealthcare = employedInHealthcare;
		this.suffix = suffix;
	}

	public void updatePatient(
		String lookupId,
		String firstName,
		String middleName,
		String lastName,
		LocalDate birthDate,
		StreetAddress address,
		String telephone,
		String role,
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
		this.typeOfHealthcareProfessional = role;
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
	public String getSuffix() {
		return suffix;
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

	@JsonIgnore
	public String getStreet() {
		if(address == null || address.getStreet() == null || address.getStreet().isEmpty()) {
			return "";
		}
		return address.getStreet().get(0);
	}

	@JsonIgnore
	public String getStreetTwo() {
		if(address == null || address.getStreet() == null || address.getStreet().size() < 2) {
			return "";
		}
		return address.getStreet().get(1);
	}

	@JsonIgnore
	public String getCity() {
		if(address == null) {
			return "";
		}
		return address.getCity();
	}

	@JsonIgnore
	public String getState() {
		if(address == null) {
			return "";
		}
		return address.getState();
	}

	@JsonIgnore
	public String getZipCode() {
		if(address == null) {
			return "";
		}
		return address.getPostalCode();
	}

	@JsonIgnore
	public String getCounty() {
		if(address == null) {
			return "";
		}
		return address.getCounty();
	}

	@JsonIgnore
	public List<TestOrder> getTestResults() {
		return testOrders;
	}

	@JsonIgnore
	public String getRole() {
		return typeOfHealthcareProfessional; // TODO this is extremely bad smelling
	}
}