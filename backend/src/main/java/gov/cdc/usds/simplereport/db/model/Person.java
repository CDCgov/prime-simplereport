package gov.cdc.usds.simplereport.db.model;

import java.util.ArrayList;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.TestResult;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
// import javax.persistence.OneToMany;

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
	@Column
	private String gender;
	@Column
	private String race;
	@Column
	private String ethnicity;
	@Column(nullable = false)
	private String street;
	@Column
	private String streetTwo;
	@Column
	private String city;
	@Column
	private String county;
	@Column(nullable = false)
	private String state;
	@Column(nullable = false)
	private String zipCode;
	@Column
	private String telephone;
	@Column
	private String email;
	@Column(nullable = false)
	private Boolean employedInHealthcare;
	@Column
	private String typeOfHealthcareProfessional;
	@Column(nullable = false)
	private Boolean residentCongregateSetting;
	@Column
	private String patientResidencyType;
	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id")
	private Organization organization;
//	@OneToMany
	private List<TestResult> testResults;

	public Person(
		Organization organization,
		String lookupId,
		String firstName,
		String middleName,
		String lastName,
		LocalDate birthDate,
		String street,
		String streetTwo,
		String city,
		String state,
		String zipCode,
		String telephone,
		String typeOfHealthcareProfessional,
		String email,
		String county,
		String race,
		String ethnicity,
		String gender,
		Boolean residentCongregateSetting,
		Boolean employedInHealthcare
	) {
		super();
		this.lookupId = lookupId;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.birthDate = birthDate;
		this.telephone = telephone;
		this.street = street;
		this.streetTwo = streetTwo;
		this.city = city;
		this.state = state;
		this.zipCode = zipCode;
		this.organization = organization;
		this.testResults = new ArrayList<TestResult>();
		this.typeOfHealthcareProfessional = typeOfHealthcareProfessional;
		this.email = email;
		this.county = county;
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
		String street,
		String streetTwo,
		String city,
		String state,
		String zipCode,
		String telephone,
		String typeOfHealthcareProfessional,
		String email,
		String county,
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
		this.street = street;
		this.streetTwo = streetTwo;
		this.city = city;
		this.state = state;
		this.zipCode = zipCode;
		this.telephone = telephone;
		this.typeOfHealthcareProfessional = typeOfHealthcareProfessional;
		this.email = email;
		this.county = county;
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
	public String getStreet() {
		return street;
	}
	public String getStreetTwo() {
		return streetTwo;
	}
	public String getCounty() {
		return county;
	}
	public String getState() {
		return state;
	}
	public String getZipCode() {
		return zipCode;
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
	public static final long serialVersionUID = 42L;

	public void setTestResults(ArrayList<TestResult> testResults) {
		this.testResults = testResults;
	}

	public void addTestResult(TestResult testResult) {
		this.testResults.add(testResult);
	}
}