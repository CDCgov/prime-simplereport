package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;

public class Patient {

	private String patientId;
	private String firstName;
	private String middleName;
	private String lastName;
	private LocalDate birthDate;
	private String address; // super dubious
	private String phone;

	public Patient(String patientId, String firstName, String middleName, String lastName, LocalDate birthDate,
			String address, String phone) {
		super();
		this.patientId = patientId;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.birthDate = birthDate;
		this.address = address;
		this.phone = phone;
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

	public String getAddress() {
		return address;
	}

	public String getPhone() {
		return phone;
	}
}
