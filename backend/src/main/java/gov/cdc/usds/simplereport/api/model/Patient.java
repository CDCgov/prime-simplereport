package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.TestResult;

public class Patient {

	private String id;
	private String patientId;
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
	private String city;
	private String state;
	private String zipCode;
	private String phone;
	private String email;
	private Boolean employedInHealthcare;
	private String typeOfHealthcareProfessional;
	private Boolean residentCongregateSetting;
	private String patientResidencyType;
	private TestResult testResult;

	public Patient(
		String patientId,
		String firstName,
		String middleName,
		String lastName,
		LocalDate birthDate,
		String street,
		String streetTwo,
		String city,
		String state,
		String zipCode,
		String phone
	) {
		super();
		this.id = UUID.randomUUID().toString();
		this.patientId = patientId;
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
	}

	public Patient(
		String patientId,
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
		TestResult testResult
	) {
		this(patientId, firstName, middleName, lastName, birthDate, street, streetTwo, city, state, zipCode, phone);
		this.testResult = testResult;
	}


	public String getId() {
		return id;
	}

	public String getPatientId() {
		return patientId;
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

	public String getPhone() {
		return phone;
	}
}
