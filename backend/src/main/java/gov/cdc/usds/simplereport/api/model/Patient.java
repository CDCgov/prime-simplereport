package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

public class Patient {

	private String id;
	private String lookupId;
	private String firstName;
	private String middleName;
	private String lastName;
	private String suffix;
	private String race;
	private LocalDate birthDate;
	private String gender;
	private String ethnicity;
	private String street;
	private String streetTwo;
	private String county;
	private String city;
	private String state;
	private String zipCode;
	private String phone;
	private String email;
	private Boolean employedInHealthcare;
	private String typeOfHealthcareProfessional;
	private Boolean residentCongregateSetting;
	private String patientResidencyType;
	private ArrayList<TestResult> testResults;
	private Organization organization;

	public Patient(
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
		String phone,
		Organization organization,
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
		this.id = UUID.randomUUID().toString();
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
		this.phone = phone;
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
		String phone,
		Organization organization,
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
		this.phone = phone;
		this.organization = organization;
		this.typeOfHealthcareProfessional = typeOfHealthcareProfessional;
		this.email = email;
		this.county = county;
		this.race = race;
		this.ethnicity = ethnicity;
		this.gender = gender;
		this.residentCongregateSetting = residentCongregateSetting;
		this.employedInHealthcare = employedInHealthcare;
	}

	public void setTestResults(ArrayList<TestResult> testResults) {
		this.testResults = testResults;
	}

	public void addTestResult(TestResult testResult) {
		this.testResults.add(testResult);
	}

	public String getId() {
		return id;
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

	public String getTelephone() {
		return phone;
	}

	public String getEmail() {
		return phone;
	}

	public String getCounty() {
		return county;
	}

	public String getTypeOfHealthcareProfessional() {
		return typeOfHealthcareProfessional;
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
}
